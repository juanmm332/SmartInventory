using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SmartInventory.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- CONFIGURACIÓN DE SEGURIDAD JWT ---
// Definimos una clave secreta fuerte de al menos 32 caracteres (256 bits) para desarrollo
var secretKey = "PAGATELACOCA_123456789!.PAGATELACOCA_123456789!.PAGATELACOCA_123456789!";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,        // Modificable según necesidad de producción
        ValidateAudience = false,      // Modificable según necesidad de producción
        ValidateLifetime = true,       // Valida la expiración del token [cite: 161]
        ValidateIssuerSigningKey = true, // Valida la firma del token [cite: 162]
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes) // Clave de firma [cite: 163]
    };
});

builder.Services.AddAuthorization(); // Registra autorización estándar [cite: 167]

// --- DEMÁS SERVICIOS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi(); // O Scalar/Swagger según tu preferencia anterior
builder.Services.AddSingleton<InMemoryProductService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

// --- ACTIVAR EL PIPELINE DE SEGURIDAD (EL ORDEN IMPORTA) ---
app.UseAuthentication(); // ¿Quién es el usuario? [cite: 169]
app.UseAuthorization();  // ¿Qué permisos/roles tiene? [cite: 170]

app.UseHttpsRedirection();
app.MapControllers();

app.Run();