using Microsoft.AspNetCore.Http;

namespace AutoLambada.Api.Models;

public class CarCreateDto
{
    public string BrandModel { get; set; }
    public int Year { get; set; }
    public decimal Price { get; set; }
    public int Mileage { get; set; }
    public decimal EngineVolume { get; set; }
    public int EnginePower { get; set; }
    public int FuelTypeId { get; set; }
    public int BodyTypeId { get; set; }
    public int TransmissionId { get; set; }
    public string Color { get; set; }
    public string? AdditionalInfo { get; set; }

    public List<IFormFile>? Photos { get; set; }
}
