using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRCoder;
using SimpleInventory.Api.Data;
using SimpleInventory.Api.DTOs;
using SimpleInventory.Api.Models;

namespace SimpleInventory.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts([FromQuery] string? search)
    {
        var query = _context.Products.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(p => p.ProductName.ToLower().Contains(cleanSearch) || p.QRCodeValue.ToLower().Contains(cleanSearch));
        }

        var products = await query
            .OrderByDescending(p => p.CreatedDate)
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

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.ProductId == id);
        if (product == null)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }

        return Ok(new ProductResponseDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductImage = product.ProductImage,
            Price = product.Price,
            AvailableStock = product.AvailableStock,
            TotalSold = product.TotalSold,
            QRCodeValue = product.QRCodeValue,
            CreatedDate = product.CreatedDate
        });
    }

    [HttpGet("by-qr/{qrCode}")]
    public async Task<ActionResult<ProductResponseDto>> GetProductByQr(string qrCode)
    {
        if (string.IsNullOrWhiteSpace(qrCode))
        {
            return BadRequest(new { message = "Item code cannot be empty." });
        }

        var decoded = Uri.UnescapeDataString(qrCode).Trim();

        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.QRCodeValue.ToLower() == decoded.ToLower());

        if (product == null)
        {
            if (decoded.StartsWith("CROCK-", StringComparison.OrdinalIgnoreCase) && 
                int.TryParse(decoded.Substring(6), out int pid))
            {
                product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.ProductId == pid);
            }
            else if (int.TryParse(decoded, out int rawId))
            {
                product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.ProductId == rawId);
            }
        }

        if (product == null)
        {
            return NotFound(new { message = $"No item found matching: {decoded}" });
        }

        return Ok(new ProductResponseDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductImage = product.ProductImage,
            Price = product.Price,
            AvailableStock = product.AvailableStock,
            TotalSold = product.TotalSold,
            QRCodeValue = product.QRCodeValue,
            CreatedDate = product.CreatedDate
        });
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct([FromBody] ProductCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var uniqueSuffix = Guid.NewGuid().ToString("N")[..4].ToUpper();
        var tempCode = $"CROCK-{uniqueSuffix}";

        var product = new Product
        {
            ProductName = dto.ProductName.Trim(),
            ProductImage = string.IsNullOrWhiteSpace(dto.ProductImage) ? null : dto.ProductImage.Trim(),
            Price = dto.Price,
            AvailableStock = dto.InitialStockQuantity,
            TotalSold = 0,
            QRCodeValue = tempCode,
            CreatedDate = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        product.QRCodeValue = $"CROCK-{product.ProductId:D3}";
        await _context.SaveChangesAsync();

        var response = new ProductResponseDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductImage = product.ProductImage,
            Price = product.Price,
            AvailableStock = product.AvailableStock,
            TotalSold = product.TotalSold,
            QRCodeValue = product.QRCodeValue,
            CreatedDate = product.CreatedDate
        };

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(int id, [FromBody] ProductUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }

        product.ProductName = dto.ProductName.Trim();
        product.Price = dto.Price;
        product.AvailableStock = dto.AvailableStock;
        if (dto.ProductImage != null)
        {
            product.ProductImage = string.IsNullOrWhiteSpace(dto.ProductImage) ? null : dto.ProductImage.Trim();
        }

        await _context.SaveChangesAsync();

        return Ok(new ProductResponseDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            ProductImage = product.ProductImage,
            Price = product.Price,
            AvailableStock = product.AvailableStock,
            TotalSold = product.TotalSold,
            QRCodeValue = product.QRCodeValue,
            CreatedDate = product.CreatedDate
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.Include(p => p.Sales).FirstOrDefaultAsync(p => p.ProductId == id);
        if (product == null)
        {
            return NotFound(new { message = $"Item with ID {id} not found." });
        }

        if (product.Sales.Any())
        {
            _context.Sales.RemoveRange(product.Sales);
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item deleted successfully." });
    }

    [HttpPost("upload-image")]
    public async Task<ActionResult<object>> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file selected." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Only image files (.jpg, .jpeg, .png, .webp) are supported." });
        }

        var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var request = HttpContext.Request;
        var imageUrl = $"{request.Scheme}://{request.Host}/uploads/{uniqueFileName}";

        return Ok(new { url = imageUrl, fileName = uniqueFileName });
    }

    [HttpGet("export-excel")]
    public async Task<IActionResult> ExportStockToExcel()
    {
        var items = await _context.Products
            .AsNoTracking()
            .OrderBy(p => p.AvailableStock)
            .ToListAsync();

        var sb = new StringBuilder();
        // UTF-8 BOM so Excel opens with proper Indian characters and fonts without encoding issues
        sb.AppendLine("Item Code,Item Name,Price (INR),Stock Remaining,Total Items Sold,Stock Status");

        foreach (var p in items)
        {
            var status = p.AvailableStock == 0 ? "Out of Stock" : (p.AvailableStock < 5 ? "Running Out (Low)" : "Available");
            var cleanName = p.ProductName.Replace("\"", "\"\"");
            sb.AppendLine($"\"{p.QRCodeValue}\",\"{cleanName}\",{p.Price:F2},{p.AvailableStock},{p.TotalSold},\"{status}\"");
        }

        var preamble = Encoding.UTF8.GetPreamble();
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fullBytes = new byte[preamble.Length + bytes.Length];
        Buffer.BlockCopy(preamble, 0, fullBytes, 0, preamble.Length);
        Buffer.BlockCopy(bytes, 0, fullBytes, preamble.Length, bytes.Length);

        var fileName = $"Stock_Report_{DateTime.Now:yyyyMMdd_HHmm}.csv";
        return File(fullBytes, "text/csv; charset=utf-8", fileName);
    }

    [HttpPost("reset-crockery")]
    public async Task<IActionResult> ResetToCrockery()
    {
        await _context.SeedInitialDataAsync(forceReloadCrockery: true);
        return Ok(new { message = "Crockery items loaded successfully!" });
    }
}
