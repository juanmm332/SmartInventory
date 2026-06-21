using Microsoft.EntityFrameworkCore;
using SmartInventory.Data;
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
        policy.WithOrigins("http://localhost:3000", "http://localhost:3000/", "https://localhost:3000").AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi(); // O Scalar/Swagger según tu preferencia anterior
// REEMPLAZO DIRECTO PARA FORZAR LA CONEXIÓN A LA NUBE
var serviceUri = "mysql://avnadmin:AVNS_xunBH8vKwNGnW1Qxfcj@smartinventory-db-mi-3215.aivencloud.com:16051/defaultdb?ssl-mode=REQUIRED";

// 1. Obtener la cadena de conexión desde appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Registrar el DbContext configurado para MySQL local mediante Pomelo
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 1. Primero le damos permiso al puerto 3000 del Frontend
app.UseCors("AllowFrontend");

// 2. Después validamos el Token / Identidad
app.UseAuthentication();

// 3. Al final revisamos los permisos / roles
app.UseAuthorization();

//app.UseHttpsRedirection();
app.MapControllers();

app.Run();