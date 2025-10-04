namespace Thesis.DTOs.LabOrder
{
    public class LabOrderReadDTO
    {
        public int LabOrderId { get; set; }

        public int ConsultationId { get; set; }

        public int PatientId { get; set; }

        public int OrderedByUserId { get; set; }

        public DateOnly OrderDate { get; set; }

        public string Notes { get; set; }
    }
}
