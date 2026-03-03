using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoLambada.Api.Models
{
    public class Car
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string BrandModel { get; set; }

        [Range(1960, 2100)]
        public int Year { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        [Range(10000, double.MaxValue)]
        public decimal Price { get; set; }

        public int Mileage { get; set; }

        [Column(TypeName = "decimal(3,1)")]
        public decimal EngineVolume { get; set; }

        public int EnginePower { get; set; }

        // FK
        public int FuelTypeId { get; set; }
        public int BodyTypeId { get; set; }
        public int TransmissionId { get; set; }

        [MaxLength(50)]
        public string Color { get; set; }

        public string? AdditionalInfo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public FuelType FuelType { get; set; }
        public BodyType BodyType { get; set; }
        public TransmissionType Transmission { get; set; }

        public ICollection<CarPhoto> Photos { get; set; }
        public ICollection<Favorite> Favorites { get; set; }
    }
}
