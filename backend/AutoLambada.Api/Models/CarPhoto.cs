using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace AutoLambada.Api.Models
{
    public class CarPhoto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("car_id")]
        public int CarId { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("photo_url")]
        public string PhotoUrl { get; set; }

        [Column("is_main")]
        public bool IsMain { get; set; } = false;

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [JsonIgnore]
        public Car Car { get; set; }
    }
}
