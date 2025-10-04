namespace Thesis.DTOs.Payment
{
    public class PaymentCreateDTO
    {
        public int PatientId { get; set; }
        public int ConsultationId { get; set; }
        public int? AppointmentId { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; }
        public string PaymentReason { get; set; }

        public DateTime? PaymentDate { get; set; }

        public int RecordedByUserId { get; set; }

    }
}
