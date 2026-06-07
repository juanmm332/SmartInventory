using Microsoft.AspNetCore.Mvc;
using SmartInventory.Models;
using SmartInventory.Services;

namespace SmartInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly InMemoryProductService _productService;

        // Inyección por constructor
        public ProductsController(InMemoryProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Product>> Get()
        {
            var products = _productService.GetAllProducts();
            return Ok(products);
        }
    }
}