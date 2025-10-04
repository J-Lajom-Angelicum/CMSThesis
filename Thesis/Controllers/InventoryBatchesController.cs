using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.InventoryBatch;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryBatchesController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public InventoryBatchesController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/InventoryBatches
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryBatchReadDTO>>> GetInventoryBatchs()
        {
            var inventorybatches = await _context.InventoryBatches.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<InventoryBatchReadDTO>>(inventorybatches));
        }

        // GET: api/InventoryBatches/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryBatchReadDTO>> GetInventoryBatch(int id)
        {
            var inventorybatches = await _context.InventoryBatches.FindAsync(id);

            if (inventorybatches == null)
                return NotFound();

            return Ok(_mapper.Map<InventoryBatchReadDTO>(inventorybatches));
        }


        // POST: api/InventoryBatches
        [HttpPost]
        public async Task<ActionResult<InventoryBatchReadDTO>> CreateInventoryBatch(InventoryBatchCreateDTO dto)
        {
            var inventorybatches = _mapper.Map<InventoryBatch>(dto);
            _context.InventoryBatches.Add(inventorybatches);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<InventoryBatchReadDTO>(inventorybatches);
            return CreatedAtAction(nameof(GetInventoryBatch), new { id = inventorybatches.BatchId }, readDto);
        }

        // PUT: api/InventoryBatches/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryBatch(int id, InventoryBatchUpdateDTO dto)
        {
            var inventorybatches = await _context.InventoryBatches.FindAsync(id);

            if (inventorybatches == null)
                return NotFound();

            _mapper.Map(dto, inventorybatches);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/InventoryBatches/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryBatch(int id)
        {
            var InventoryBatch = await _context.InventoryBatches.FindAsync(id);

            if (InventoryBatch == null)
                return NotFound();

            _context.InventoryBatches.Remove(InventoryBatch);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
