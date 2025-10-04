namespace Thesis.DTOs.LabResult
{
    public class LabResultUpdateDTO
    {
        public string TestName { get; set; }
        public string ResultValue { get; set; }
        public string? Unit { get; set; }
        public string? ReferenceRange { get; set; }
        public DateOnly? DateReported { get; set; }
        public string? Notes { get; set; }
    }
}
