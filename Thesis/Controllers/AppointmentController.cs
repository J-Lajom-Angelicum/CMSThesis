using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ThesisContext _context;

        public AppointmentController(ThesisContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAll()
            => await _context.Appointments.Include(a => a.Patient)
                                          .Include(a => a.Doctor)
                                          .ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetById(int id)
        {
            var appt = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            return appt == null ? NotFound() : appt;
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> Create(Appointment appt)
        {
            _context.Appointments.Add(appt);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = appt.AppointmentId }, appt);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var appt = await _context.Appointments.FindAsync(id);
            if (appt == null) return NotFound();
            appt.AppointmentStatus = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
