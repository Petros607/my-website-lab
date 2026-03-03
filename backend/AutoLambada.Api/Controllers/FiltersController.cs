using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Data;

namespace AutoLambada.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiltersController : ControllerBase
{
    private readonly AppDbContext _context;

    public FiltersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetFilters()
    {
        var transmissions = await _context.TransmissionTypes.ToListAsync();
        var bodies = await _context.BodyTypes.ToListAsync();
        var fuels = await _context.FuelTypes.ToListAsync();

        var colors = await _context.Cars
            .Select(c => c.Color)
            .Distinct()
            .ToListAsync();

        return Ok(new
        {
            transmissions,
            bodies,
            fuels,
            colors
        });
    }
}
