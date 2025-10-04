using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.Consultation;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public ConsultationsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Consultation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConsultationReadDTO>>> GetConsultations()
        {
            var consultation = await _context.Consultations
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<ConsultationReadDTO>>(consultation));
        }

        // GET: api/Consultations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConsultationReadDTO>> GetConsultation(int id)
        {
            var consultation = await _context.Consultations
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.ConsultationId == id);

            if (consultation == null)
                return NotFound();

            return Ok(_mapper.Map<ConsultationReadDTO>(consultation));
        }

        // POST: api/Consultations
        [HttpPost]
        public async Task<ActionResult<ConsultationReadDTO>> CreateConsultation([FromBody] ConsultationCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            //Check if Patient Exists
            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null)
                return NotFound($"Patient with ID {dto.PatientId} not found.");

            //Check if doctor exists
            var doctor = await _context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null)
                return NotFound($"Doctor with ID {dto.DoctorId} not found.");

            //Validate date
            if (dto.ConsultationDate < DateTime.Now)
                return BadRequest("Consultation Date cannot be in the past.");


            var Consultation = _mapper.Map<Consultation>(dto);
            _context.Consultations.Add(Consultation);
            await _context.SaveChangesAsync();

            var readDTO = _mapper.Map<ConsultationReadDTO>(Consultation);
            return CreatedAtAction(nameof(GetConsultation), new { id = Consultation.ConsultationId }, readDTO);
        }


        //PUT: api/Consultations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsultation(int id, ConsultationUpdateDTO dto)
        {
            var consultation = await _context.Consultations.FindAsync(id);

            if (consultation == null)
                return NotFound();

            _mapper.Map(dto, consultation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Delete: api/Consultations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsultation(int id)
        {
            var consultation = await _context.Consultations.FindAsync(id);

            if (consultation == null)
                return NotFound();

            _context.Consultations.Remove(consultation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
