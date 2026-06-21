using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartInventory.Data;
using SmartInventory.Models;

namespace SmartInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Inyectamos el DbContext de la base de datos real
        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. GET ALL: Consultar todos los productos en MySQL
        [HttpGet]
        [Authorize(Roles = "admin,seller")]
        public async Task<ActionResult<IEnumerable<Product>>> Get()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        // 2. GET BY ID: Buscar un producto por su clave primaria
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,seller")]
        public async Task<ActionResult<Product>> GetById(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(new { message = $"El producto con ID {id} no fue encontrado." });
            }

            return Ok(product);
        }

        // 3. POST: Insertar un nuevo producto en MySQL
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Product>> Post([FromBody] Product newProduct)
        {
            if (string.IsNullOrWhiteSpace(newProduct.Name) || newProduct.Price <= 0 || newProduct.Stock < 0)
            {
                return BadRequest(new { message = "Datos del producto inválidos." });
            }

            // Agregamos el objeto al set de datos
            _context.Products.Add(newProduct);
            // Guardamos los cambios de forma asíncrona en la base de datos
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = newProduct.Id }, newProduct);
        }

        // 4. PUT: Modificar un producto existente
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Put(int id, [FromBody] Product updatedProduct)
        {
            if (string.IsNullOrWhiteSpace(updatedProduct.Name) || updatedProduct.Price <= 0 || updatedProduct.Stock < 0)
            {
                return BadRequest(new { message = "Datos inválidos." });
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound(new { message = $"El producto con ID {id} no existe." });
            }

            // Actualizamos las propiedades
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Stock = updatedProduct.Stock;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Producto actualizado con éxito en MySQL." });
        }

        // 5. DELETE: Eliminar físicamente un registro por ID
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public IActionResult Delete(int id)
        {
            // Nota: Para mantener sincronía sincrónica con tu firma anterior,
            // podemos buscarlo de forma directa usando Find
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound(new { message = $"El producto con ID {id} no existe." });
            }

            _context.Products.Remove(product);
            _context.SaveChanges();

            return StatusCode(201, new { message = $"Producto con ID {id} eliminado correctamente de MySQL." });
        }
    }
}