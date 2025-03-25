using System.ComponentModel.DataAnnotations;

namespace Pet.Dtos.Account
{
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
