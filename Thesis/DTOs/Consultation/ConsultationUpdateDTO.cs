namespace Thesis.DTOs.Consultation
{
    public class ConsultationUpdateDTO
    {
        public DateTime ConsultationDate { get; set; }

        public string Notes { get; set; }
        public string Diagnosis { get; set; }
        public string Treatment { get; set; }
    }
}
