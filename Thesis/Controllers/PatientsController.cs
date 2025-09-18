using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.DTOs.Patient;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public PatientsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PatientReadDTO>>> GetPatients()
        {
            var patients = await _context.Patients.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<PatientReadDTO>>(patients));
        }

        // GET: api/Patients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PatientReadDTO>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
                return NotFound();

            return Ok(_mapper.Map<PatientReadDTO>(patient));
        }


        // POST: api/Patients
        [HttpPost]
        public async Task<ActionResult<PatientReadDTO>> CreatePatient(PatientCreateDTO dto)
        {
            var patient = _mapper.Map<Patient>(dto);
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<PatientReadDTO>(patient);
            return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientId }, readDto);
        }

        // PUT: api/Patients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, PatientUpdateDTO dto)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
                return NotFound();

            _mapper.Map(dto, patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Patients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
                return NotFound();

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
