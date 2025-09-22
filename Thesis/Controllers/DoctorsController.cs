using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.Doctor;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public DoctorsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Doctors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorReadDTO>>> GetDoctors()
        {
            var doctors = await _context.Doctors.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<DoctorReadDTO>>(doctors));
        }

        // GET: api/Doctors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorReadDTO>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
                return NotFound();

            return Ok(_mapper.Map<DoctorReadDTO>(doctor));
        }


        // POST: api/Doctors
        [HttpPost]
        public async Task<ActionResult<DoctorReadDTO>> CreateDoctor(DoctorCreateDTO dto)
        {
            var doctor = _mapper.Map<Doctor>(dto);
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<DoctorReadDTO>(doctor);
            return CreatedAtAction(nameof(GetDoctor), new { id = doctor.DoctorId }, readDto);
        }

        // PUT: api/Doctors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, DoctorUpdateDTO dto)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
                return NotFound();

            _mapper.Map(dto, doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Doctors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
                return NotFound();

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
