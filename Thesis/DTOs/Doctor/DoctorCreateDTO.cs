namespace Thesis.DTOs.Doctor
{
    public class DoctorCreateDTO
    {
        public int UserId { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Specialty { get; set; }

        public string LicenseNo { get; set; }
    }
}
