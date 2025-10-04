namespace Thesis.DTOs.ConsultationInventory
{
    public class ConsultationInventoryReadDTO
    {
        public int ConsultationInventoryId { get; set; }

        public int ConsultationId { get; set; }

        public int BatchId { get; set; }

        public int QuantityUsed { get; set; }

        public string Notes { get; set; }
    }
}
