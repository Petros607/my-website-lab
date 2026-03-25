using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Data;
using AutoLambada.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace AutoLambada.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CarsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // =========================================================
    // GET /api/cars
    // =========================================================
    [HttpGet]
    public async Task<IActionResult> GetCars(
        int? transmission_id,
        string? color,
        int? body_type_id,
        int? fuel_type_id,
        decimal? price_min,
        decimal? price_max,
        int? mileage_max,
        int? year_min,
        int? year_max,
        string? search,
        int page = 1,
        int limit = 6)
    {
        var query = _context.Cars
            .Include(c => c.Photos)
            .AsQueryable();

        if (transmission_id.HasValue)
            query = query.Where(c => c.TransmissionId == transmission_id);

        if (body_type_id.HasValue)
            query = query.Where(c => c.BodyTypeId == body_type_id);

        if (fuel_type_id.HasValue)
            query = query.Where(c => c.FuelTypeId == fuel_type_id);

        if (!string.IsNullOrEmpty(color))
            query = query.Where(c => c.Color == color);

        if (price_min.HasValue)
            query = query.Where(c => c.Price >= price_min);

        if (price_max.HasValue)
            query = query.Where(c => c.Price <= price_max);

        if (mileage_max.HasValue)
            query = query.Where(c => c.Mileage <= mileage_max);

        if (year_min.HasValue)
            query = query.Where(c => c.Year >= year_min);

        if (year_max.HasValue)
            query = query.Where(c => c.Year <= year_max);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(c => EF.Functions.ILike(c.BrandModel, $"%{search}%"));

        query = query.OrderByDescending(c => c.Id);

        var cars = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return Ok(cars);
    }

    // =========================================================
    // POST /api/cars    [Authorize(Roles = "admin")]
    // =========================================================
    [HttpPost]
    public async Task<IActionResult> CreateCar([FromForm] CarCreateDto dto)
    {
        var car = new Car
        {
            BrandModel = dto.BrandModel,
            Year = dto.Year,
            Price = dto.Price,
            Mileage = dto.Mileage,
            EngineVolume = dto.EngineVolume,
            EnginePower = dto.EnginePower,
            FuelTypeId = dto.FuelTypeId,
            BodyTypeId = dto.BodyTypeId,
            TransmissionId = dto.TransmissionId,
            Color = dto.Color,
            AdditionalInfo = dto.AdditionalInfo
        };

        _context.Cars.Add(car);
        await _context.SaveChangesAsync();

        // --- Фото ---
        if (dto.Photos != null && dto.Photos.Count > 0)
        {
            string uploadPath = Path.Combine(_env.WebRootPath, "uploads");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            for (int i = 0; i < dto.Photos.Count; i++)
            {
                var file = dto.Photos[i];
                var fileName = $"{DateTime.UtcNow.Ticks}-{file.FileName}";
                var filePath = Path.Combine(uploadPath, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                var photo = new CarPhoto
                {
                    CarId = car.Id,
                    PhotoUrl = $"/uploads/{fileName}",
                    IsMain = i == 0,
                    SortOrder = i
                };

                _context.CarPhotos.Add(photo);
            }

            await _context.SaveChangesAsync();
        }

        return StatusCode(201, new { message = "Авто создано" });
    }

    // =========================================================
    // DELETE /api/cars/{id} ([Authorize(Roles = "admin")])
    // =========================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCar(int id)
    {
        var car = await _context.Cars
            .Include(c => c.Photos)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (car == null)
            return NotFound(new { error = "Авто не найдено" });

        // удаляем файлы
        foreach (var photo in car.Photos)
        {
            var filePath = Path.Combine(
                _env.WebRootPath,
                //"api", //TODO: без api (просто папка uploads)
                photo.PhotoUrl.TrimStart('/')
            );

            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        _context.Cars.Remove(car);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Авто удалено" });
    }
}
