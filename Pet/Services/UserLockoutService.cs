using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Pet.Datas;
using Pet.Models;
using Pet.Services.IServices;

namespace Pet.Services
{
    public class UserLockoutService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<UserLockoutService> _logger;

        public UserLockoutService(IServiceProvider serviceProvider, ILogger<UserLockoutService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("UserLockoutService started at {Time}", DateTimeOffset.UtcNow);
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Checking locked users at {Time}", DateTimeOffset.UtcNow);
                using (var scope = _serviceProvider.CreateScope())
                {
                    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var lockedUsers = await context.Users
                        .Where(u => u.LockoutEnabled && u.LockoutEnd.HasValue && u.LockoutEnd <= DateTimeOffset.UtcNow)
                        .ToListAsync();

                    _logger.LogInformation("Found {Count} users to unlock", lockedUsers.Count);
                    foreach (var user in lockedUsers)
                    {
                        _logger.LogInformation("Unlocking user {UserId}. LockoutEnd was {LockoutEnd}", user.Id, user.LockoutEnd);
                        user.LockoutEnabled = false;
                        user.LockoutEnd = null;
                        user.LockReason = LockReason.None;
                        await userManager.UpdateAsync(user);
                        await context.SaveChangesAsync();

                        await emailService.SendEmailAsync(user.Email, "Account Unlocked",
                            "Your account has been automatically unlocked as the lock period has expired.");
                        _logger.LogInformation("Unlocked user {UserId}", user.Id);
                    }
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Tạm thời giảm xuống 1 phút để test
            }
        }
    }
}
