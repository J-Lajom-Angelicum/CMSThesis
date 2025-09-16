namespace Thesis.DTOs.User
{
    public class UserCreateDTO
    {
        public string Username { get; set; }

        public string UserPassword { get; set; }

        public string Email { get; set; }

        public string ContactNo { get; set; }

        public int RoleId { get; set; }

        public bool IsActive { get; set; }
    }
}
