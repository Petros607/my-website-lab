using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoLambada.Api.Models
{
    public class Car
    {
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("brand_model")]
        public string BrandModel { get; set; }

        [Column("year")]
        [Range(1960, 2100)]
        public int Year { get; set; }

        [Column("price", TypeName = "decimal(12,2)")]
        [Range(10000, double.MaxValue)]
        public decimal Price { get; set; }

        [Column("mileage")]
        public int Mileage { get; set; }

        [Column("engine_volume", TypeName = "decimal(3,1)")]
        public decimal EngineVolume { get; set; }

        [Column("engine_power")]
        public int EnginePower { get; set; }

        [Column("fuel_type_id")]
        public int FuelTypeId { get; set; }

        [Column("body_type_id")]
        public int BodyTypeId { get; set; }

        [Column("transmission_id")]
        public int TransmissionId { get; set; }

        [Column("color")]
        [MaxLength(50)]
        public string Color { get; set; }

        [Column("additional_info")]
        public string? AdditionalInfo { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public FuelType FuelType { get; set; }
        public BodyType BodyType { get; set; }
        public TransmissionType Transmission { get; set; }

        public ICollection<CarPhoto> Photos { get; set; }
        public ICollection<Favorite> Favorites { get; set; }
    }
}
