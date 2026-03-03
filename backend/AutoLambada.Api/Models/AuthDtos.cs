namespace AutoLambada.Api.Models;

public record RegisterDto(string Username, string Email, string Phone, string Password);
public record LoginDto(string Login, string Password); // login = email или phone
