using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Data;

namespace AutoLambada.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("db-check")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                var carsCount = await _context.Cars.CountAsync();

                return Ok(new
                {
                    Message = "✅ Database connected successfully",
                    CarsCount = carsCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"❌ DB Error: {ex.Message}");
            }
        }
    }
}
