using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimpleInventory.Api.Models;

public class Product
{
    [Key]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    public string? ProductImage { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, 1000000)]
    public decimal Price { get; set; }

    [Range(0, 1000000)]
    public int AvailableStock { get; set; }

    [Range(0, 1000000)]
    public int TotalSold { get; set; } = 0;

    [Required]
    [MaxLength(100)]
    public string QRCodeValue { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
