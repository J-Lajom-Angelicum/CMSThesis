namespace Thesis.DTOs.Payment
{
    public class PaymentUpdateDTO
    {
        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; }
        public string PaymentReason { get; set; }

        public DateTime? PaymentDate { get; set; }
    }
}
