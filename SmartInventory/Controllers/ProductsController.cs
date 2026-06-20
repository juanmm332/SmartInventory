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

        // 1. GET: api/products (Ya lo tenías hecho)
        [HttpGet]
        public ActionResult<IEnumerable<Product>> Get()
        {
            var products = _productService.GetAllProducts();
            return Ok(products);
        }

        // 2. GET: api/products/{id}
        [HttpGet("{id}")]
        public ActionResult<Product> GetById(int id)
        {
            var product = _productService.GetProductById(id);

            if (product == null)
            {
                return NotFound(new { message = $"El producto con ID {id} no fue encontrado." }); // Status 404 
            }

            return Ok(product); // Status 200 
        }

        // 3. POST: api/products
        [HttpPost]
        public ActionResult<Product> Post([FromBody] Product newProduct)
        {
            // Validaciones básicas solicitadas 
            if (string.IsNullOrWhiteSpace(newProduct.Name))
            {
                return BadRequest(new { message = "El nombre del producto es obligatorio." }); // Status 400 
            }

            if (newProduct.Price <= 0)
            {
                return BadRequest(new { message = "El precio debe ser mayor a 0." }); // Status 400 
            }

            if (newProduct.Stock < 0)
            {
                return BadRequest(new { message = "El stock no puede ser negativo." }); // Status 400 
            }

            var createdProduct = _productService.AddProduct(newProduct);

            // Devuelve 201 Created junto con la URL para acceder al nuevo recurso 
            return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, createdProduct);
        }

        // 4. PUT: api/products/{id}
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Product updatedProduct)
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(updatedProduct.Name) || updatedProduct.Price <= 0 || updatedProduct.Stock < 0)
            {
                return BadRequest(new { message = "Datos del producto inválidos para la actualización." });
            }

            var updated = _productService.UpdateProduct(id, updatedProduct);

            if (!updated)
            {
                // Si el producto no existía, la consigna abre la posibilidad de retornar 201 si se creara, 
                // o manejar el flujo tradicional. Vamos a retornar un BadRequest o NotFound si no se pudo actualizar.
                return NotFound(new { message = $"No se pudo actualizar. El producto con ID {id} no existe." });
            }

            return Ok(new { message = "Producto actualizado con éxito." }); // Status 200 
        }

        // 5. DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var deleted = _productService.DeleteProduct(id);

            if (!deleted)
            {
                return NotFound(new { message = $"No se pudo eliminar. El producto con ID {id} no existe." }); // Status 404 
            }

            // Nota: La consigna menciona explícitamente asegurar los status code 201 y 404 para el DELETE.
            // Aunque el estándar HTTP suele usar 200 u 204 para borrado, respondemos con 201 según lo requerido.
            return StatusCode(201, new { message = $"Producto con ID {id} eliminado correctamente." }); // Status 201 
        }
    }
}