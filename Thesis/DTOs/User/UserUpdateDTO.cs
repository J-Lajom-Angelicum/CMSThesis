namespace Thesis.DTOs.User
{
    public class UserUpdateDTO
    {
        public string Email { get; set; }

        public string ContactNo { get; set; }

        public int RoleId { get; set; }

        public bool IsActive { get; set; }

        public string? UserPassword { get; set; } // Optional: update only if given
    }
}
