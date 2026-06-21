using Microsoft.EntityFrameworkCore;
using SmartInventory.Models;

namespace SmartInventory.Data
{
    public class ApplicationDbContext : DbContext
    {
        // El constructor le pasa la configuración (como la conexión a MySQL) a la clase base de EF Core
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Esta propiedad le dice a EF Core que queremos una tabla llamada "Products" basada en nuestro modelo Product
        public DbSet<Product> Products { get; set; }
    }
}