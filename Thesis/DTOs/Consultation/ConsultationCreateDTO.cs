namespace Thesis.DTOs.Consultation
{
    public class ConsultationCreateDTO
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int? AppointmentId { get; set; }

        public DateTime ConsultationDate { get; set; }

        public string Notes { get; set; }
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
    }
}
