using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleInventory.Api.Data;
using SimpleInventory.Api.DTOs;
using SimpleInventory.Api.Models;

namespace SimpleInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SaleResponseDto>>> GetSales([FromQuery] int limit = 50)
    {
        var sales = await _context.Sales
            .AsNoTracking()
            .Include(s => s.Product)
            .OrderByDescending(s => s.SaleDate)
            .Take(limit)
            .Select(s => new SaleResponseDto
            {
                SaleId = s.SaleId,
                ProductId = s.ProductId,
                ProductName = s.Product != null ? s.Product.ProductName : "Unknown Product",
                ProductImage = s.Product != null ? s.Product.ProductImage : null,
                Quantity = s.Quantity,
                UnitPrice = s.UnitPrice,
                TotalAmount = s.TotalAmount,
                SaleDate = s.SaleDate
            })
            .ToListAsync();

        return Ok(sales);
    }

    [HttpPost]
    public async Task<ActionResult<SaleResponseDto>> RecordSale([FromBody] SaleCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (dto.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than zero." });
        }

        // Database transaction ensuring atomic stock update and sale recording
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);
            if (product == null)
            {
                return NotFound(new { message = $"Product with ID {dto.ProductId} was not found." });
            }

            // Rule: Never allow negative stock
            if (product.AvailableStock < dto.Quantity)
            {
                return BadRequest(new
                {
                    message = $"Insufficient stock. Available: {product.AvailableStock}, Requested: {dto.Quantity}."
                });
            }

            // Deduct stock and increment total sold
            product.AvailableStock -= dto.Quantity;
            product.TotalSold += dto.Quantity;

            var totalAmount = product.Price * dto.Quantity;

            var sale = new Sale
            {
                ProductId = product.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.Price,
                TotalAmount = totalAmount,
                SaleDate = DateTime.UtcNow
            };

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            var response = new SaleResponseDto
            {
                SaleId = sale.SaleId,
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductImage = product.ProductImage,
                Quantity = sale.Quantity,
                UnitPrice = sale.UnitPrice,
                TotalAmount = sale.TotalAmount,
                SaleDate = sale.SaleDate
            };

            return CreatedAtAction(nameof(GetSales), new { id = sale.SaleId }, response);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Failed to record sale.", error = ex.Message });
        }
    }
}
