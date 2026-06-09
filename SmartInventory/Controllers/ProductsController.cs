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

        [HttpGet("{id}")]
        public ActionResult<Product> Get(int id)
        {
            var product = _productService.GetProductById(id);
            return product is null ? NotFound() : Ok(product);
        }

        [HttpPost]
        public ActionResult<Product> Create(ProductCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
            {
                return BadRequest("Nombre, precio y stock deben ser válidos.");
            }

            var product = _productService.AddProduct(dto.Name.Trim(), dto.Price, dto.Stock);
            return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ProductUpdateDto dto)
        {
            if (dto.Price < 0 || dto.Stock < 0)
            {
                return BadRequest("Precio y stock deben ser valores positivos.");
            }

            if (!_productService.UpdateProduct(id, dto.Price, dto.Stock))
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_productService.DeleteProduct(id))
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}