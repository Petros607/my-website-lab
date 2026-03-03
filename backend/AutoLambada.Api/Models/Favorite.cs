namespace AutoLambada.Api.Models
{
    public class Favorite
    {
        public int UserId { get; set; }
        public int CarId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Car Car { get; set; }
    }
}
