using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.Payment;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public PaymentsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentReadDTO>>> GetPayments()
        {
            var Payments = await _context.Payments.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<PaymentReadDTO>>(Payments));
        }

        // GET: api/Payments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentReadDTO>> GetPayment(int id)
        {
            var Payment = await _context.Payments.FindAsync(id);

            if (Payment == null)
                return NotFound();

            return Ok(_mapper.Map<PaymentReadDTO>(Payment));
        }


        // POST: api/Payments
        [HttpPost]
        public async Task<ActionResult<PaymentReadDTO>> CreatePayment(PaymentCreateDTO dto)
        {
            var Payment = _mapper.Map<Payment>(dto);
            _context.Payments.Add(Payment);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<PaymentReadDTO>(Payment);
            return CreatedAtAction(nameof(GetPayment), new { id = Payment.PaymentId }, readDto);
        }

        // PUT: api/Payments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, PaymentUpdateDTO dto)
        {
            var Payment = await _context.Payments.FindAsync(id);

            if (Payment == null)
                return NotFound();

            _mapper.Map(dto, Payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Payments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var Payment = await _context.Payments.FindAsync(id);

            if (Payment == null)
                return NotFound();

            _context.Payments.Remove(Payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
