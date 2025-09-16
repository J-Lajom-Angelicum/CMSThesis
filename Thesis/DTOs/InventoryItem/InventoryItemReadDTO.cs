namespace Thesis.DTOs.InventoryItem
{
    public class InventoryItemReadDTO
    {
        public int ItemId { get; set; }

        public string ItemName { get; set; }

        public string ItemCategory { get; set; }

        public string ItemDescription { get; set; }

        public string Unit { get; set; }

        public int ReorderLevel { get; set; }

        public int? SupplierId { get; set; }

        public DateOnly DateAdded { get; set; }
    }
}
