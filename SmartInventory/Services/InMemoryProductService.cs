using SmartInventory.Models;

namespace SmartInventory.Services
{
    public class InMemoryProductService
    {
        private readonly List<Product> _products;

        public InMemoryProductService()
        {
            // Datos mockeados
            _products = new List<Product>
            {
                new Product { Id = 1, Name = "Notebook", Price = 1200.50m, Stock = 10 },
                new Product { Id = 2, Name = "Mouse Inalámbrico", Price = 25.99m, Stock = 50 },
                new Product { Id = 3, Name = "Teclado Mecánico", Price = 85.00m, Stock = 20 }
            };
        }

        public IEnumerable<Product> GetAllProducts()
        {
            return _products;
        }
    }
}