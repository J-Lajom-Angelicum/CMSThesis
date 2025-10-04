namespace Thesis.DTOs.QueueEntry
{
    public class QueueEntryUpdateDTO
    {
        public string Status { get; set; }

        public int? DoctorId { get; set; }
        public int? ConsultationId { get; set; }
    }
}
