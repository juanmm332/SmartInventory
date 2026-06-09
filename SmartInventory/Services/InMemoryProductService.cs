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

        public Product? GetProductById(int id)
        {
            return _products.FirstOrDefault(p => p.Id == id);
        }

        public Product AddProduct(string name, decimal price, int stock)
        {
            var nextId = _products.Any() ? _products.Max(p => p.Id) + 1 : 1;
            var product = new Product { Id = nextId, Name = name, Price = price, Stock = stock };
            _products.Add(product);
            return product;
        }

        public bool UpdateProduct(int id, decimal price, int stock)
        {
            var existing = GetProductById(id);
            if (existing is null)
            {
                return false;
            }

            existing.Price = price;
            existing.Stock = stock;
            return true;
        }

        public bool DeleteProduct(int id)
        {
            var existing = GetProductById(id);
            if (existing is null)
            {
                return false;
            }

            return _products.Remove(existing);
        }
    }
}