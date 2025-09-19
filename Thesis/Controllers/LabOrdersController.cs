using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.LabOrder;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabOrdersController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public LabOrdersController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/LabOrders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LabOrderReadDTO>>> GetLabOrders()
        {
            var LabOrders = await _context.LabOrders.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<LabOrderReadDTO>>(LabOrders));
        }

        // GET: api/LabOrders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LabOrderReadDTO>> GetLabOrder(int id)
        {
            var LabOrder = await _context.LabOrders.FindAsync(id);

            if (LabOrder == null)
                return NotFound();

            return Ok(_mapper.Map<LabOrderReadDTO>(LabOrder));
        }


        // POST: api/LabOrders
        [HttpPost]
        public async Task<ActionResult<LabOrderReadDTO>> CreateLabOrder(LabOrderCreateDTO dto)
        {
            var LabOrder = _mapper.Map<LabOrder>(dto);
            _context.LabOrders.Add(LabOrder);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<LabOrderReadDTO>(LabOrder);
            return CreatedAtAction(nameof(GetLabOrder), new { id = LabOrder.LabOrderId }, readDto);
        }

        // PUT: api/LabOrders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLabOrder(int id, LabOrderUpdateDTO dto)
        {
            var LabOrder = await _context.LabOrders.FindAsync(id);

            if (LabOrder == null)
                return NotFound();

            _mapper.Map(dto, LabOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/LabOrders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLabOrder(int id)
        {
            var LabOrder = await _context.LabOrders.FindAsync(id);

            if (LabOrder == null)
                return NotFound();

            _context.LabOrders.Remove(LabOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
