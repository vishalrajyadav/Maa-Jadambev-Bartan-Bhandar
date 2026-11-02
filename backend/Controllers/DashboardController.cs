using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimpleInventory.Api.Data;
using SimpleInventory.Api.DTOs;

namespace SimpleInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var totalProducts = await _context.Products.CountAsync();
        var availableStock = await _context.Products.SumAsync(p => (int?)p.AvailableStock) ?? 0;
        var totalItemsSold = await _context.Products.SumAsync(p => (int?)p.TotalSold) ?? 0;
        var lowStockCount = await _context.Products.CountAsync(p => p.AvailableStock < 5);

        // Best selling products (Top 5)
        var bestSelling = await _context.Products
            .AsNoTracking()
            .OrderByDescending(p => p.TotalSold)
            .Take(5)
            .Select(p => new ProductResponseDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                AvailableStock = p.AvailableStock,
                TotalSold = p.TotalSold,
                QRCodeValue = p.QRCodeValue,
                CreatedDate = p.CreatedDate
            })
            .ToListAsync();

        // Recently sold products (Top 5)
        var recentSales = await _context.Sales
            .AsNoTracking()
            .Include(s => s.Product)
            .OrderByDescending(s => s.SaleDate)
            .Take(5)
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

        // Low stock products (AvailableStock < 5)
        var lowStockProducts = await _context.Products
            .AsNoTracking()
            .Where(p => p.AvailableStock < 5)
            .OrderBy(p => p.AvailableStock)
            .Select(p => new ProductResponseDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductImage = p.ProductImage,
                Price = p.Price,
                AvailableStock = p.AvailableStock,
                TotalSold = p.TotalSold,
                QRCodeValue = p.QRCodeValue,
                CreatedDate = p.CreatedDate
            })
            .ToListAsync();

        var summary = new DashboardSummaryDto
        {
            TotalProducts = totalProducts,
            AvailableStock = availableStock,
            TotalItemsSold = totalItemsSold,
            LowStockProducts = lowStockCount,
            BestSellingProducts = bestSelling,
            RecentlySoldProducts = recentSales,
            LowStockProductsList = lowStockProducts
        };

        return Ok(summary);
    }
}
