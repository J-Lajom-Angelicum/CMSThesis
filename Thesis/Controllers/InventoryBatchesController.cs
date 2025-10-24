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

        // ✅ GET: api/InventoryBatches?itemId=3
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryBatchReadDTO>>> GetInventoryBatches([FromQuery] int? itemId)
        {
            var query = _context.InventoryBatches.AsQueryable();

            if (itemId.HasValue)
                query = query.Where(b => b.ItemId == itemId.Value);

            var inventoryBatches = await query.ToListAsync();

            return Ok(_mapper.Map<IEnumerable<InventoryBatchReadDTO>>(inventoryBatches));
        }

        // ✅ GET: api/InventoryBatches/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryBatchReadDTO>> GetInventoryBatch(int id)
        {
            var batch = await _context.InventoryBatches.FindAsync(id);

            if (batch == null)
                return NotFound();

            return Ok(_mapper.Map<InventoryBatchReadDTO>(batch));
        }

        // ✅ POST: api/InventoryBatches
        // Automatically creates a corresponding InventoryTransaction record
        [HttpPost]
        public async Task<ActionResult<InventoryBatchReadDTO>> CreateInventoryBatch(InventoryBatchCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Create new batch
            var batch = _mapper.Map<InventoryBatch>(dto);
            _context.InventoryBatches.Add(batch);
            await _context.SaveChangesAsync();

            // Auto-create transaction (Restock)
            var transaction = new InventoryTransaction
            {
                BatchId = batch.BatchId,
                QuantityChange = batch.QuantityInStock,
                TransactionType = "Restock",
                TransactionDate = DateTime.Now,
                // PerformedByUserId can be set if you track logged-in user
            };

            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<InventoryBatchReadDTO>(batch);
            return CreatedAtAction(nameof(GetInventoryBatch), new { id = batch.BatchId }, readDto);
        }

        // ✅ PUT: api/InventoryBatches/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryBatch(int id, InventoryBatchUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var batch = await _context.InventoryBatches.FindAsync(id);
            if (batch == null)
                return NotFound();

            _mapper.Map(dto, batch);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE: api/InventoryBatches/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryBatch(int id)
        {
            var batch = await _context.InventoryBatches.FindAsync(id);

            if (batch == null)
                return NotFound();

            _context.InventoryBatches.Remove(batch);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
