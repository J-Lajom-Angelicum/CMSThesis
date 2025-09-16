using Microsoft.EntityFrameworkCore;
using Thesis.Mapping;
using Thesis.Models;
using Thesis.Mapping;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
