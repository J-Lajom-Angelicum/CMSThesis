namespace Thesis.DTOs.Appointment
{
    public class AppointmentCreateDTO
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string? Notes { get; set; }
    }
}
