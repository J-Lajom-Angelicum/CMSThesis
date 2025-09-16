namespace Thesis.DTOs.InventoryBatch
{
    public class InventoryBatchUpdateDTO
    {
        public string BatchNumber { get; set; }

        public int QuantityInStock { get; set; }

        public DateOnly ExpirationDate { get; set; }

        public DateOnly DateReceived { get; set; }
    }
}
