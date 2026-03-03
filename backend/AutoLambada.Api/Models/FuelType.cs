using System.ComponentModel.DataAnnotations;

namespace AutoLambada.Api.Models
{
    public class FuelType
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Name { get; set; }

        public ICollection<Car> Cars { get; set; }
    }
}
