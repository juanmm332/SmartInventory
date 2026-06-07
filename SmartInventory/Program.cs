using Scalar.AspNetCore;
using SmartInventory.Services;

namespace SmartInventory
{
    public class Program
    {
        public static void Main(string[] args)
        {
         

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.AllowAnyOrigin() // En producción se restringe, para clase usamos Any
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddSingleton<InMemoryProductService>();

            var app = builder.Build();

           
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            
            app.UseCors("AllowFrontend");

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
