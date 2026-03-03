using Microsoft.EntityFrameworkCore;
using AutoLambada.Api.Models;

namespace AutoLambada.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Car> Cars { get; set; }
        public DbSet<FuelType> FuelTypes { get; set; }
        public DbSet<BodyType> BodyTypes { get; set; }
        public DbSet<TransmissionType> TransmissionTypes { get; set; }
        public DbSet<CarPhoto> CarPhotos { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 🔹 Указываем реальные имена таблиц в PostgreSQL
            modelBuilder.Entity<Car>().ToTable("cars");
            modelBuilder.Entity<FuelType>().ToTable("fuel_types");
            modelBuilder.Entity<BodyType>().ToTable("body_types");
            modelBuilder.Entity<TransmissionType>().ToTable("transmission_types");
            modelBuilder.Entity<CarPhoto>().ToTable("car_photos");
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Favorite>().ToTable("favorites");

            // 🔹 Composite key для favorites
            modelBuilder.Entity<Favorite>()
                .HasKey(f => new { f.UserId, f.CarId });

            // 🔹 Связи favorites → user/car
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId);

            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Car)
                .WithMany(c => c.Favorites)
                .HasForeignKey(f => f.CarId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
