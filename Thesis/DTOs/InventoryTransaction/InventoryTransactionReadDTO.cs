namespace Thesis.DTOs.InventoryTransaction
{
    public class InventoryTransactionReadDTO
    {
        public int TransactionId { get; set; }
        public int BatchId { get; set; }
        public string BatchNumber { get; set; }  // optional: from InventoryBatch
        public string ItemName { get; set; }     // optional: from InventoryBatch → InventoryItem
        public int QuantityChange { get; set; }
        public string TransactionType { get; set; }
        public int? ReferenceId { get; set; }
        public int? PerformedByUserId { get; set; }
        public string PerformedByUserName { get; set; }  // optional: join from Users
        public DateTime TransactionDate { get; set; }
    }
}
