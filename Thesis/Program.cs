using Microsoft.EntityFrameworkCore;
using Thesis.Mapping;
using Thesis.Models;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ThesisContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ThesisConnection")));

//This is the one for AutoMapper v15
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<ThesisProfile>();
    // Add other profiles here if you have more
});

var app = builder.Build();

// --- SEED DATA HERE ---
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ThesisContext>();

    // Seed Roles if not exist
    if (!context.Roles.Any())
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { RoleName = "Doctor" },
                new Role { RoleName = "Staff" },
                new Role { RoleName = "Admin" }
            );
            context.SaveChanges();
        }

    // Seed Users if not exist
    if (!context.Users.Any())
    {
        var roles = context.Roles.ToList(); // get IDs assigned automatically

        context.Users.AddRange(
            new User { Username = "admin", UserPassword = "admin123", Email = "admin@test.com", RoleId = roles.First(r => r.RoleName == "Admin").RoleId, IsActive = true },
            new User { Username = "doctor", UserPassword = "doctor123", Email = "doctor@test.com", RoleId = roles.First(r => r.RoleName == "Doctor").RoleId, IsActive = true },
            new User { Username = "staff", UserPassword = "staff123", Email = "staff@test.com", RoleId = roles.First(r => r.RoleName == "Staff").RoleId, IsActive = true }
        );
        context.SaveChanges();
    }
}
// --- END SEED ---

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("AllowAll");


app.UseAuthorization();

app.MapControllers();

app.Run();
