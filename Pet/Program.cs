using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Services.IServices;
using Pet.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CloudinaryDotNet;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Identity
builder.Services.AddIdentity<User, Role>(options => {
    // Configure identity options here
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        NameClaimType = JwtRegisteredClaimNames.Sub, // Định nghĩa sub là Name claim
        RoleClaimType = ClaimTypes.Role // Đảm bảo role được đọc đúng
    };
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully.");
            var claims = context.Principal?.Claims.Select(c => $"{c.Type}: {c.Value}");
            Console.WriteLine("Validated token claims: " + string.Join(", ", claims));
            return Task.CompletedTask;
        }
    };
    options.SaveToken = true; // Lưu token gốc để kiểm tra sau
    options.MapInboundClaims = false; // Tắt ánh xạ mặc định để giữ nguyên claims từ token
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Google:ClientId"];
    options.ClientSecret = builder.Configuration["Google:ClientSecret"];
});

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Add Scoped service
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ISupplierService, SupplierService>();

builder.Services.AddLogging(logging => logging.AddConsole());
builder.Services.AddHostedService<UserLockoutService>();

builder.Services.AddSingleton<Cloudinary>(provider =>
{
    var config = provider.GetRequiredService<IConfiguration>();
    var cloudName = config["Cloudinary:CloudName"];
    var apiKey = config["Cloudinary:ApiKey"];
    var apiSecret = config["Cloudinary:ApiSecret"];
    return new Cloudinary(new Account(cloudName, apiKey, apiSecret));
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Nếu cần gửi cookie hoặc Authorization header
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Use(async (context, next) =>
{
    var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
    if (!string.IsNullOrEmpty(token))
    {
        var decodedToken = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Console.WriteLine($"[Middleware] Raw token claims: {string.Join(", ", decodedToken.Claims.Select(c => $"{c.Type}: {c.Value}"))}");
    }
    await next(context);
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend"); // Enable CORS

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
