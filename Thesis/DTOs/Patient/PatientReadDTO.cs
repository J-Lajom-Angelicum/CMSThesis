namespace Thesis.DTOs.Patient
{
    public class PatientReadDTO
    {
        public int PatientId { get; set; }
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string ContactNo { get; set; }

        public string Email { get; set; }

        public DateOnly BirthDate { get; set; }

        public string PatientSex { get; set; }
    }
}

