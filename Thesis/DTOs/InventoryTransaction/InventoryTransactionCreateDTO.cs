namespace Thesis.DTOs.InventoryTransaction
{
    public class InventoryTransactionCreateDTO
    {
        public int BatchId { get; set; }
        public int QuantityChange { get; set; }
        public string TransactionType { get; set; }
        public int? ReferenceId { get; set; }
        public int? PerformedByUserId { get; set; }
    }
}
