namespace Thesis.DTOs.InventoryBatch
{
    public class InventoryBatchReadDTO
    {
        public int BatchId { get; set; }

        public int ItemId { get; set; }

        public string BatchNumber { get; set; }

        public int QuantityInStock { get; set; }

        public DateOnly ExpirationDate { get; set; }

        public DateOnly DateReceived { get; set; }
    }
}
