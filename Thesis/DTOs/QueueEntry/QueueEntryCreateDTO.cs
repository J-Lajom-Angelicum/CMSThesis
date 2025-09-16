namespace Thesis.DTOs.QueueEntry
{
    public class QueueEntryCreateDTO
    {
        public int PatientId { get; set; }
        public int? AppointmentId { get; set; }

        public string Status { get; set; }

        public int? DoctorId { get; set; }
        public int? ConsultationId { get; set; }
    }
}
