namespace Thesis.DTOs.Appointment
{
    public class AppointmentUpdateDTO
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string AppointmentStatus { get; set; }
        public string Notes { get; set; }
    }
}
