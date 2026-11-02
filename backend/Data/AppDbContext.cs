using Microsoft.EntityFrameworkCore;
using SimpleInventory.Api.Models;

namespace SimpleInventory.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Sale> Sales => Set<Sale>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.QRCodeValue).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.QRCodeValue).IsUnique();
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.SaleId);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

            entity.HasOne(e => e.Product)
                  .WithMany(p => p.Sales)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }

    public async Task SeedInitialDataAsync(bool forceReloadCrockery = false)
    {
        var hasCrockery = await Products.AnyAsync(p => p.ProductName.Contains("Plate") || p.ProductName.Contains("Cups") || p.ProductName.Contains("Crockery"));
        
        if (!forceReloadCrockery && hasCrockery)
        {
            return;
        }

        // Clean out previous non-crockery sample items if requested
        if (forceReloadCrockery || !hasCrockery)
        {
            Sales.RemoveRange(await Sales.ToListAsync());
            Products.RemoveRange(await Products.ToListAsync());
            await SaveChangesAsync();
        }

        var sampleCrockery = new List<Product>
        {
            new Product
            {
                ProductName = "Royal Gold-Rim Dinner Plates Set (6 Pcs)",
                ProductImage = "/uploads/crockery_dinner_set.jpg",
                Price = 1450.00m,
                AvailableStock = 20,
                TotalSold = 65,
                QRCodeValue = "CROCK-001",
                CreatedDate = DateTime.UtcNow.AddDays(-28)
            },
            new Product
            {
                ProductName = "Handmade Tea Cups & Kettle Set (6 Cups)",
                ProductImage = "/uploads/crockery_cups_set.jpg",
                Price = 850.00m,
                AvailableStock = 15,
                TotalSold = 88,
                QRCodeValue = "CROCK-002",
                CreatedDate = DateTime.UtcNow.AddDays(-22)
            },
            new Product
            {
                ProductName = "Ceramic Curry Serving Bowl (Large 1.5L)",
                ProductImage = "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
                Price = 420.00m,
                AvailableStock = 3, // Low stock demo (< 5)
                TotalSold = 120,
                QRCodeValue = "CROCK-003",
                CreatedDate = DateTime.UtcNow.AddDays(-18)
            },
            new Product
            {
                ProductName = "Traditional Clay Chai Kulhad Cups (Pack of 12)",
                ProductImage = "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=600&q=80",
                Price = 180.00m,
                AvailableStock = 48,
                TotalSold = 210,
                QRCodeValue = "CROCK-004",
                CreatedDate = DateTime.UtcNow.AddDays(-14)
            },
            new Product
            {
                ProductName = "Clear Glass Water Tumblers (Set of 6)",
                ProductImage = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
                Price = 320.00m,
                AvailableStock = 25,
                TotalSold = 45,
                QRCodeValue = "CROCK-005",
                CreatedDate = DateTime.UtcNow.AddDays(-10)
            },
            new Product
            {
                ProductName = "Porcelain Soup Bowls with Spoons (Set of 4)",
                ProductImage = "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
                Price = 550.00m,
                AvailableStock = 2, // Low stock demo (< 5)
                TotalSold = 94,
                QRCodeValue = "CROCK-006",
                CreatedDate = DateTime.UtcNow.AddDays(-7)
            },
            new Product
            {
                ProductName = "Ceramic Coffee Mugs Pair (2 Pcs)",
                ProductImage = "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80",
                Price = 290.00m,
                AvailableStock = 32,
                TotalSold = 50,
                QRCodeValue = "CROCK-007",
                CreatedDate = DateTime.UtcNow.AddDays(-3)
            }
        };

        await Products.AddRangeAsync(sampleCrockery);
        await SaveChangesAsync();

        // Sample sales
        var sales = new List<Sale>
        {
            new Sale
            {
                ProductId = sampleCrockery[0].ProductId,
                Quantity = 2,
                UnitPrice = sampleCrockery[0].Price,
                TotalAmount = sampleCrockery[0].Price * 2,
                SaleDate = DateTime.UtcNow.AddHours(-4)
            },
            new Sale
            {
                ProductId = sampleCrockery[2].ProductId,
                Quantity = 1,
                UnitPrice = sampleCrockery[2].Price,
                TotalAmount = sampleCrockery[2].Price,
                SaleDate = DateTime.UtcNow.AddHours(-2)
            },
            new Sale
            {
                ProductId = sampleCrockery[3].ProductId,
                Quantity = 4,
                UnitPrice = sampleCrockery[3].Price,
                TotalAmount = sampleCrockery[3].Price * 4,
                SaleDate = DateTime.UtcNow.AddMinutes(-45)
            }
        };

        await Sales.AddRangeAsync(sales);
        await SaveChangesAsync();
    }
}
