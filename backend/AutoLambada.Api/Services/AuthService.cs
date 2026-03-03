using AutoLambada.Api.Data;
using AutoLambada.Api.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoLambada.Api.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    private string JwtSecret => _config["JWT_SECRET"] ?? "super_secret_key_that_is_long_enough_1234";

    public async Task<User?> GetUserByLoginAsync(string login)
    {
        if (login.Contains("@"))
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == login);

        var cleanPhone = new string(login.Where(char.IsDigit).ToArray());

        var users = await _context.Users.ToListAsync();

        return users.FirstOrDefault(u =>
            u.Phone == login || new string(u.Phone.Where(char.IsDigit).ToArray()) == cleanPhone);
    }


    public string GenerateJwt(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(JwtSecret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                                                        SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<User> RegisterAsync(string username, string email, string phone, string password)
    {
        var hashed = BCrypt.Net.BCrypt.HashPassword(password);

        var user = new User
        {
            Username = username,
            Email = email,
            Phone = phone,
            PasswordHash = hashed,
            Role = "user"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> CheckPasswordAsync(User user, string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public async Task<bool> UsernameExists(string username) =>
        await _context.Users.AnyAsync(u => u.Username == username);

    public async Task<bool> EmailExists(string email) =>
        await _context.Users.AnyAsync(u => u.Email == email);

    public async Task<bool> PhoneExists(string phone) =>
        await _context.Users.AnyAsync(u => u.Phone == phone);
}
