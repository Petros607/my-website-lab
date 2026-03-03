using Microsoft.AspNetCore.Mvc;
using AutoLambada.Api.Models;
using AutoLambada.Api.Services;

namespace AutoLambada.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Phone) ||
            string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { error = "Все поля обязательны" });

        if (await _auth.UsernameExists(dto.Username))
            return BadRequest(new { error = "Логин уже занят" });

        if (await _auth.EmailExists(dto.Email))
            return BadRequest(new { error = "Email уже используется" });

        if (await _auth.PhoneExists(dto.Phone))
            return BadRequest(new { error = "Телефон уже используется" });

        var user = await _auth.RegisterAsync(dto.Username, dto.Email, dto.Phone, dto.Password);
        var token = _auth.GenerateJwt(user);

        return Created("", new
        {
            message = "Пользователь зарегистрирован",
            token,
            user = new { user.Id, user.Username, user.Email, user.Phone, user.Role }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _auth.GetUserByLoginAsync(dto.Login);
        if (user == null)
            return BadRequest(new { error = "Неверный логин или пароль" });

        if (!await _auth.CheckPasswordAsync(user, dto.Password))
            return BadRequest(new { error = "Неверный логин или пароль" });

        var token = _auth.GenerateJwt(user);

        return Ok(new
        {
            message = "Успешный вход",
            token,
            user = new { user.Id, user.Username, user.Email, user.Phone, user.Role }
        });
    }

    [HttpPost("check-username")]
    public async Task<IActionResult> CheckUsername([FromBody] string username)
    {
        if (string.IsNullOrWhiteSpace(username) || username.Length < 2)
            return BadRequest(new { available = false, message = "Слишком короткий логин" });

        bool exists = await _auth.UsernameExists(username);
        return Ok(new { available = !exists, message = exists ? "Логин занят" : "Логин доступен" });
    }

    [HttpPost("check-email")]
    public async Task<IActionResult> CheckEmail([FromBody] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { available = false, message = "Введите email" });

        bool exists = await _auth.EmailExists(email);
        return Ok(new { available = !exists, message = exists ? "Email уже используется" : "Email доступен" });
    }

    [HttpPost("check-phone")]
    public async Task<IActionResult> CheckPhone([FromBody] string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return BadRequest(new { available = false, message = "Введите телефон" });

        bool exists = await _auth.PhoneExists(phone);
        return Ok(new { available = !exists, message = exists ? "Телефон уже используется" : "Телефон доступен" });
    }
}
