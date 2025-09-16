namespace Thesis.DTOs.Consultation
{
    public class ConsulationReadDTO
    {
        public int ConsultationId { get; set; }

        public int PatientId { get; set; }

        public int DoctorId { get; set; }

        public int? AppointmentId { get; set; }

        public DateTime ConsultationDate { get; set; }

        public string Notes { get; set; }

        public string Diagnosis { get; set; }

        public string Treatment { get; set; }
    }
}
