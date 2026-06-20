using Microsoft.AspNetCore.Authorization; // <-- IMPORTANTE
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

        public ProductsController(InMemoryProductService productService)
        {
            _productService = productService;
        }

        // 1. GET ALL: Tanto admin como seller pueden consultar
        [HttpGet]
        [Authorize(Roles = "admin,seller")] // Permite ambos roles
        public ActionResult<IEnumerable<Product>> Get()
        {
            var products = _productService.GetAllProducts();
            return Ok(products);
        }

        // 2. GET BY ID: Tanto admin como seller pueden consultar
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,seller")] // Permite ambos roles
        public ActionResult<Product> GetById(int id)
        {
            var product = _productService.GetProductById(id);
            if (product == null)
            {
                return NotFound(new { message = $"El producto con ID {id} no fue encontrado." });
            }
            return Ok(product);
        }

        // 3. POST: SOLO admin puede crear
        [HttpPost]
        [Authorize(Roles = "admin")] // Exclusivo
        public ActionResult<Product> Post([FromBody] Product newProduct)
        {
            if (string.IsNullOrWhiteSpace(newProduct.Name) || newProduct.Price <= 0 || newProduct.Stock < 0)
            {
                return BadRequest(new { message = "Datos del producto inválidos." });
            }

            var createdProduct = _productService.AddProduct(newProduct);
            return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, createdProduct);
        }

        // 4. PUT: SOLO admin puede modificar
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")] // Exclusivo
        public IActionResult Put(int id, [FromBody] Product updatedProduct)
        {
            if (string.IsNullOrWhiteSpace(updatedProduct.Name) || updatedProduct.Price <= 0 || updatedProduct.Stock < 0)
            {
                return BadRequest(new { message = "Datos inválidos." });
            }

            var updated = _productService.UpdateProduct(id, updatedProduct);
            if (!updated)
            {
                return NotFound(new { message = $"El producto con ID {id} no existe." });
            }

            return Ok(new { message = "Producto actualizado con éxito." });
        }

        // 5. DELETE: SOLO admin puede eliminar
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")] // Exclusivo
        public IActionResult Delete(int id)
        {
            var deleted = _productService.DeleteProduct(id);
            if (!deleted)
            {
                return NotFound(new { message = $"El producto con ID {id} no existe." });
            }

            return StatusCode(201, new { message = $"Producto con ID {id} eliminado correctamente." });
        }
    }
}