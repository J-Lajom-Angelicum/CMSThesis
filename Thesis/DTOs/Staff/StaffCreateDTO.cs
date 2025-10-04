namespace Thesis.DTOs.Staff
{
    public class StaffCreateDTO
    {
        public int UserId { get; set; }   // must be linked to an existing User
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
