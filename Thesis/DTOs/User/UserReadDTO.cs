namespace Thesis.DTOs
{
    public class UserReadDTO
    {
        public int UserId { get; set; }

        public string Username { get; set; }

        public string Email { get; set; }

        public string ContactNo { get; set; }

        public int RoleId { get; set; }

        public bool IsActive { get; set; }
    }
}
