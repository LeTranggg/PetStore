using Pet.Models;
using System.Text.Json.Serialization;

namespace Pet.Dtos.Account
{
    public class RegisterDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Gender Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public bool? FromGoogle { get; set; }
    }
}
