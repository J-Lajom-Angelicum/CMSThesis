using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.ConsultationInventory;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationInventoriesController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public ConsultationInventoriesController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/ConsultationInventories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConsultationInventoryReadDTO>>> GetConsultationInventories()
        {
            var ConsultationInventories = await _context.ConsultationInventories.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<ConsultationInventoryReadDTO>>(ConsultationInventories));
        }

        // GET: api/ConsultationInventories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConsultationInventoryReadDTO>> GetConsultationInventory(int id)
        {
            var ConsultationInventory = await _context.ConsultationInventories.FindAsync(id);

            if (ConsultationInventory == null)
                return NotFound();

            return Ok(_mapper.Map<ConsultationInventoryReadDTO>(ConsultationInventory));
        }


        // POST: api/ConsultationInventories
        [HttpPost]
        public async Task<ActionResult<ConsultationInventoryReadDTO>> CreateConsultationInventory(ConsultationInventoryCreateDTO dto)
        {
            var ConsultationInventory = _mapper.Map<ConsultationInventory>(dto);
            _context.ConsultationInventories.Add(ConsultationInventory);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<ConsultationInventoryReadDTO>(ConsultationInventory);
            return CreatedAtAction(nameof(GetConsultationInventory), new { id = ConsultationInventory.ConsultationInventoryId }, readDto);
        }

        // PUT: api/ConsultationInventories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsultationInventory(int id, ConsultationInventoryUpdateDTO dto)
        {
            var ConsultationInventory = await _context.ConsultationInventories.FindAsync(id);

            if (ConsultationInventory == null)
                return NotFound();

            _mapper.Map(dto, ConsultationInventory);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ConsultationInventories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsultationInventory(int id)
        {
            var ConsultationInventory = await _context.ConsultationInventories.FindAsync(id);

            if (ConsultationInventory == null)
                return NotFound();

            _context.ConsultationInventories.Remove(ConsultationInventory);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
