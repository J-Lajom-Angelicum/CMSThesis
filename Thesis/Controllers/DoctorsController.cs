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
            var Doctors = await _context.Doctors.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<DoctorReadDTO>>(Doctors));
        }

        // GET: api/Doctors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DoctorReadDTO>> GetDoctor(int id)
        {
            var Doctor = await _context.Doctors.FindAsync(id);

            if (Doctor == null)
                return NotFound();

            return Ok(_mapper.Map<DoctorReadDTO>(Doctor));
        }


        // POST: api/Doctors
        [HttpPost]
        public async Task<ActionResult<DoctorReadDTO>> CreateDoctor(DoctorCreateDTO dto)
        {
            var Doctor = _mapper.Map<Doctor>(dto);
            _context.Doctors.Add(Doctor);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<DoctorReadDTO>(Doctor);
            return CreatedAtAction(nameof(GetDoctor), new { id = Doctor.DoctorId }, readDto);
        }

        // PUT: api/Doctors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDoctor(int id, DoctorUpdateDTO dto)
        {
            var Doctor = await _context.Doctors.FindAsync(id);

            if (Doctor == null)
                return NotFound();

            _mapper.Map(dto, Doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Doctors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var Doctor = await _context.Doctors.FindAsync(id);

            if (Doctor == null)
                return NotFound();

            _context.Doctors.Remove(Doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
