using System.ComponentModel.DataAnnotations;

namespace AutoLambada.Api.Models
{
    public class CarPhoto
    {
        public int Id { get; set; }

        public int CarId { get; set; }

        [Required]
        [MaxLength(500)]
        public string PhotoUrl { get; set; }

        public bool IsMain { get; set; } = false;

        public int SortOrder { get; set; } = 0;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Car Car { get; set; }
    }
}
