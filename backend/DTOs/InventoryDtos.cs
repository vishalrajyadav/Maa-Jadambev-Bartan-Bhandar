using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SimpleInventory.Api.DTOs;

public class ProductCreateDto
{
    [Required(ErrorMessage = "Product name is required")]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public string? ProductImage { get; set; }

    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Price must be greater than zero")]
    public decimal Price { get; set; }

    [Required]
    [Range(0, 1000000, ErrorMessage = "Initial stock cannot be negative")]
    public int InitialStockQuantity { get; set; }
}

public class ProductUpdateDto
{
    [Required(ErrorMessage = "Product name is required")]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public string? ProductImage { get; set; }

    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Price must be greater than zero")]
    public decimal Price { get; set; }

    [Required]
    [Range(0, 1000000, ErrorMessage = "Available stock cannot be negative")]
    public int AvailableStock { get; set; }
}

public class ProductResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public decimal Price { get; set; }
    public int AvailableStock { get; set; }
    public int TotalSold { get; set; }
    public string QRCodeValue { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public bool IsLowStock => AvailableStock < 5;
}

public class SaleCreateDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Product ID is required")]
    public int ProductId { get; set; }

    [Required]
    [Range(1, 100000, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
}

public class SaleResponseDto
{
    public int SaleId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime SaleDate { get; set; }
}

public class DashboardSummaryDto
{
    public int TotalProducts { get; set; }
    public int AvailableStock { get; set; }
    public int TotalItemsSold { get; set; }
    public int LowStockProducts { get; set; }
    public List<ProductResponseDto> BestSellingProducts { get; set; } = new();
    public List<SaleResponseDto> RecentlySoldProducts { get; set; } = new();
    public List<ProductResponseDto> LowStockProductsList { get; set; } = new();
}
