using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoLambada.Api.Models
{
    public class FuelType
    {
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("name")]
        public string Name { get; set; }

        public ICollection<Car> Cars { get; set; }
    }
}
