namespace Thesis.DTOs.QueueEntry
{
    public class QueueEntryReadDTO
    {
        public int QueueEntryId { get; set; }

        public int PatientId { get; set; }

        public int? AppointmentId { get; set; }

        public DateTime CreatedAt { get; set; }

        public string Status { get; set; }

        public int? DoctorId { get; set; }

        public int? ConsultationId { get; set; }
    }
}
