using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SmartInventory.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartInventory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Validaciones fijas según el escenario del PDF 
            if (request.Username == "admin" && request.Password == "1234")
                return Ok(GenerateToken("admin"));

            if (request.Username == "seller" && request.Password == "1234")
                return Ok(GenerateToken("seller"));

            return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
        }

        private object GenerateToken(string role)
        {
            // ATENCIÓN: Debe coincidir exactamente con la clave de Program.cs
            var secretKey = "PAGATELACOCA_123456789!.PAGATELACOCA_123456789!.PAGATELACOCA_123456789!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Inyectamos las declaraciones (Claims) de Identidad y Rol 
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, role),
                new Claim(ClaimTypes.Role, role)  // Clave para Authorize(Roles = "...") 
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token) // Serializa a string largo 
            };
        }
    }
}