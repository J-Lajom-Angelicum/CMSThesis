namespace Thesis.DTOs.Patient
{
    public class PatientUpdateDTO
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string? ContactNo { get; set; }

        public string? Email { get; set; }

        public string PatientSex { get; set; }

        // Optional: only update if provided
        public DateOnly? BirthDate { get; set; }
    }
}
