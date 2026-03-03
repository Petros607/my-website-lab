using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var key = Encoding.UTF8.GetBytes(builder.Configuration["JWT_SECRET"] ?? "super_secret_key");

// 🔹 Добавляем контроллеры (MVC)
builder.Services.AddControllers();

// 🔹 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 🔹 Подключение PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// 🔹 JWT аутентификация
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// 🔹 CORS (чтобы фронт работал)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

var app = builder.Build();

// 🔹 Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔹 CORS
app.UseCors("AllowAll");

// 🔹 Статика (wwwroot/uploads)
app.UseStaticFiles();

// 🔹 HTTPS редирект
app.UseHttpsRedirection();

// 🔹 Аутентификация и авторизация
app.UseAuthentication(); // 🔹 ОБЯЗАТЕЛЬНО до UseAuthorization
app.UseAuthorization();

// 🔹 Маршрутизация контроллеров
app.MapControllers();

app.Run();
