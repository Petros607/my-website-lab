using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Data;
using AutoLambada.Api.Models;
using System.Security.Claims;

namespace AutoLambada.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // весь контроллер требует JWT
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // POST /api/favorites
    // =========================================================
    [HttpPost]
    public async Task<IActionResult> AddToFavorites([FromBody] int car_id)
    {
        var userId = int.Parse(User.FindFirstValue("id")!);

        var carExists = await _context.Cars.AnyAsync(c => c.Id == car_id);
        if (!carExists)
            return NotFound(new { error = "Автомобиль не найден" });

        var exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.CarId == car_id);

        if (!exists)
        {
            _context.Favorites.Add(new Favorite
            {
                UserId = userId,
                CarId = car_id,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Добавлено в избранное" });
    }

    // =========================================================
    // DELETE /api/favorites/{car_id}
    // =========================================================
    [HttpDelete("{car_id}")]
    public async Task<IActionResult> RemoveFromFavorites(int car_id)
    {
        var userId = int.Parse(User.FindFirstValue("id")!);

        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == car_id);

        if (favorite != null)
        {
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Удалено из избранного" });
    }

    // =========================================================
    // GET /api/favorites
    // =========================================================
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = int.Parse(User.FindFirstValue("id")!);

        var favorites = await _context.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Include(f => f.Car)
                .ThenInclude(c => c.Photos)
            .Select(f => new
            {
                f.Car.Id,
                f.Car.BrandModel,
                f.Car.Price,
                f.Car.Year,
                f.Car.Mileage,
                f.CreatedAt,
                Photos = f.Car.Photos
                    .OrderBy(p => p.SortOrder)
                    .Select(p => new
                    {
                        p.PhotoUrl,
                        p.IsMain
                    })
            })
            .ToListAsync();

        return Ok(favorites);
    }

    // =========================================================
    // GET /api/favorites/check/{car_id}
    // =========================================================
    [HttpGet("check/{car_id}")]
    public async Task<IActionResult> CheckFavorite(int car_id)
    {
        var userId = int.Parse(User.FindFirstValue("id")!);

        bool exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.CarId == car_id);

        return Ok(new { isFavorite = exists });
    }
}
