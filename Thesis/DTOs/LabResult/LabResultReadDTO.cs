namespace Thesis.DTOs.LabResult
{
    public class LabResultReadDTO
    {
        public int LabResultId { get; set; }

        public int LabOrderId { get; set; }

        public string TestName { get; set; }

        public string ResultValue { get; set; }

        public string Unit { get; set; }

        public string ReferenceRange { get; set; }

        public DateOnly? DateReported { get; set; }

        public string Notes { get; set; }
    }
}
