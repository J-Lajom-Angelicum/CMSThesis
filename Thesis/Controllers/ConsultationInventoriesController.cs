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

            // --- Create linked InventoryTransaction ---
            var transaction = new InventoryTransaction
            {
                BatchId = ConsultationInventory.BatchId,
                QuantityChange = -ConsultationInventory.QuantityUsed, // negative for usage
                TransactionType = "Usage",
                ReferenceId = ConsultationInventory.ConsultationInventoryId, // link to usage
                TransactionDate = DateTime.Now,
                //PerformedByUserId = dto.PerformedByUserId // optional if your DTO tracks the user
            };
            _context.InventoryTransactions.Add(transaction);

            // Adjust batch stock immediately
            var batch = await _context.InventoryBatches.FindAsync(ConsultationInventory.BatchId);
            if (batch != null)
                batch.QuantityInStock -= ConsultationInventory.QuantityUsed;

            await _context.SaveChangesAsync();
            // ----------------------------------------

            var readDto = _mapper.Map<ConsultationInventoryReadDTO>(ConsultationInventory);
            return CreatedAtAction(nameof(GetConsultationInventory), new { id = ConsultationInventory.ConsultationInventoryId }, readDto);
        }

        // PUT: api/ConsultationInventories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsultationInventory(int id, ConsultationInventoryUpdateDTO dto)
        {
            var consultationInventory = await _context.ConsultationInventories.FindAsync(id);
            if (consultationInventory == null)
                return NotFound();

            // Find the batch related to the old record
            var oldBatch = await _context.InventoryBatches.FindAsync(consultationInventory.BatchId);
            if (oldBatch != null)
            {
                // Revert the old quantityUsed from stock
                oldBatch.QuantityInStock += consultationInventory.QuantityUsed;
            }

            // Map new values
            _mapper.Map(dto, consultationInventory);

            // Apply new quantityUsed to stock
            var newBatch = await _context.InventoryBatches.FindAsync(consultationInventory.BatchId);
            if (newBatch != null)
            {
                if (newBatch.QuantityInStock < consultationInventory.QuantityUsed)
                    return BadRequest("Not enough stock in batch for this update.");

                newBatch.QuantityInStock -= consultationInventory.QuantityUsed;
            }

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
