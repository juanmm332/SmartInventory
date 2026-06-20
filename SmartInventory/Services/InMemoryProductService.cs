using SmartInventory.Models;

namespace SmartInventory.Services
{
    public class InMemoryProductService
    {
        private readonly List<Product> _products;
        private int _nextId = 4; // Como metemos 3 productos mockeados, el próximo ID inicial será el 4

        public InMemoryProductService()
        {
            _products = new List<Product>
            {
                new Product { Id = 1, Name = "Notebook", Price = 1250.00m, Stock = 15 },
                new Product { Id = 2, Name = "Mouse Inalámbrico", Price = 35.50m, Stock = 40 },
                new Product { Id = 3, Name = "Teclado Mecánico", Price = 95.00m, Stock = 25 }
            };
        }

        // GET ALL
        public IEnumerable<Product> GetAllProducts()
        {
            return _products;
        }

        // GET BY ID
        public Product? GetProductById(int id)
        {
            return _products.FirstOrDefault(p => p.Id == id);
        }

        // POST (Crear)
        public Product AddProduct(Product product)
        {
            product.Id = _nextId++;
            _products.Add(product);
            return product;
        }

        // PUT (Actualizar)
        public bool UpdateProduct(int id, Product updatedProduct)
        {
            var existingProduct = GetProductById(id);
            if (existingProduct == null) return false;

            existingProduct.Name = updatedProduct.Name;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Stock = updatedProduct.Stock;

            return true;
        }

        // DELETE (Eliminar)
        public bool DeleteProduct(int id)
        {
            var product = GetProductById(id);
            if (product == null) return false;

            _products.Remove(product);
            return true;
        }
    }
}