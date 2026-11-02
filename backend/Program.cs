using Microsoft.EntityFrameworkCore;
using Npgsql;
using SimpleInventory.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Resolve connection string from environment variable or appsettings
var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=SimpleInventoryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

// Helper to convert postgres:// URI to Npgsql connection string if needed
string ParseConnectionString(string conn)
{
    if (conn.StartsWith("postgres://") || conn.StartsWith("postgresql://"))
    {
        try
        {
            var uri = new Uri(conn);
            var userInfo = uri.UserInfo.Split(':');
            var npgsqlBuilder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.Port > 0 ? uri.Port : 5432,
                Username = userInfo[0],
                Password = userInfo.Length > 1 ? userInfo[1] : "",
                Database = uri.AbsolutePath.TrimStart('/'),
                SslMode = SslMode.Require,
                TrustServerCertificate = true
            };
            return npgsqlBuilder.ConnectionString;
        }
        catch
        {
            return conn;
        }
    }
    return conn;
}

var finalConnection = ParseConnectionString(rawConnection);
bool isPostgres = rawConnection.StartsWith("postgres") || rawConnection.Contains("Host=") || rawConnection.Contains("sslmode=");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (isPostgres)
    {
        options.UseNpgsql(finalConnection);
    }
    else
    {
        options.UseSqlServer(finalConnection);
    }
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Auto-create database schema and seed starter data if needed
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        await db.SeedInitialDataAsync(forceReloadCrockery: false);
        app.Logger.LogInformation("Database verified and initialized successfully.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Database initialization warning (will retry on first request): " + ex.Message);
    }
}

app.UseCors("AllowAll");
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    shop = "Maa Jagdambe Bartan Bhandar",
    address = "Pankaj Cinema ke bagal wali gali, Dahiyawa, Chhapra, Bihar",
    status = "healthy",
    database = isPostgres ? "PostgreSQL (Cloud)" : "SQL Server"
}));

app.Run();
