using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace AutoLambada.Api.Models
{
    public class Favorite
    {
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("car_id")]
        public int CarId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Car Car { get; set; }
    }
}
