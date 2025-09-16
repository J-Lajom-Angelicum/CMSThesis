using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationController : ControllerBase
    {
        private readonly ThesisContext _context;

        public ConsultationController(ThesisContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Consultation>> GetById(int id)
        {
            var c = await _context.Consultations
                .Include(c => c.Patient)
                .Include(c => c.Doctor)
                .FirstOrDefaultAsync(c => c.ConsultationId == id);

            return c == null ? NotFound() : c;
        }

        [HttpPost]
        public async Task<ActionResult<Consultation>> Create(Consultation consultation)
        {
            _context.Consultations.Add(consultation);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = consultation.ConsultationId }, consultation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Consultation consultation)
        {
            if (id != consultation.ConsultationId) return BadRequest();
            _context.Entry(consultation).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
