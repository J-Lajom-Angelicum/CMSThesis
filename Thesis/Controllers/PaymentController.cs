using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ThesisContext _context;

        public PaymentController(ThesisContext context)
        {
            _context = context;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetByPatient(int patientId)
            => await _context.Payments.Where(p => p.PatientId == patientId).ToListAsync();

        [HttpPost]
        public async Task<ActionResult<Payment>> Create(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByPatient), new { patientId = payment.PatientId }, payment);
        }
    }
}
