using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryTransactionsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public InventoryTransactionsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ✅ GET: api/InventoryTransactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetInventoryTransactions()
        {
            var transactions = await _context.InventoryTransactions
                .Include(t => t.Batch)
                .Include(t => t.PerformedByUser)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    t.TransactionId,
                    t.TransactionType,
                    t.QuantityChange,
                    t.TransactionDate,
                    t.ReferenceId,
                    t.PerformedByUserId,
                    PerformedBy = t.PerformedByUser != null ? t.PerformedByUser.Username : null, // ✅ Username instead of FullName
                    t.BatchId,
                    t.Batch.BatchNumber, // ✅ Corrected field name
                    t.Batch.ExpirationDate,
                    t.Batch.ItemId // ✅ Clean reference
                })
                .ToListAsync();

            return Ok(transactions);
        }

        // ✅ GET: api/InventoryTransactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetInventoryTransaction(int id)
        {
            var transaction = await _context.InventoryTransactions
                .Include(t => t.Batch)
                .Include(t => t.PerformedByUser)
                .Where(t => t.TransactionId == id)
                .Select(t => new
                {
                    t.TransactionId,
                    t.TransactionType,
                    t.QuantityChange,
                    t.TransactionDate,
                    t.ReferenceId,
                    t.PerformedByUserId,
                    PerformedBy = t.PerformedByUser != null ? t.PerformedByUser.Username : null, // ✅ Fixed
                    t.BatchId,
                    t.Batch.BatchNumber,
                    t.Batch.ExpirationDate,
                    t.Batch.ItemId
                })
                .FirstOrDefaultAsync();

            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        // ✅ POST: api/InventoryTransactions
        [HttpPost]
        public async Task<ActionResult> CreateInventoryTransaction([FromBody] InventoryTransaction transaction)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            transaction.TransactionDate = DateTime.Now;
            _context.InventoryTransactions.Add(transaction);

            var batch = await _context.InventoryBatches.FindAsync(transaction.BatchId);
            if (batch != null)
                batch.QuantityInStock += transaction.QuantityChange;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Transaction recorded successfully." });
        }

        // ✅ PUT: api/InventoryTransactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryTransaction(int id, [FromBody] InventoryTransaction updated)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _context.InventoryTransactions.FindAsync(id);
            if (existing == null)
                return NotFound();

            // Revert old batch stock
            var oldBatch = await _context.InventoryBatches.FindAsync(existing.BatchId);
            if (oldBatch != null)
                oldBatch.QuantityInStock -= existing.QuantityChange;

            // Apply new batch stock
            var newBatch = await _context.InventoryBatches.FindAsync(updated.BatchId);
            if (newBatch != null)
                newBatch.QuantityInStock += updated.QuantityChange;

            // Update fields
            existing.QuantityChange = updated.QuantityChange;
            existing.TransactionType = updated.TransactionType;
            existing.ReferenceId = updated.ReferenceId;
            existing.PerformedByUserId = updated.PerformedByUserId;
            existing.BatchId = updated.BatchId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Transaction updated successfully." });
        }

        // ✅ DELETE: api/InventoryTransactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryTransaction(int id)
        {
            var transaction = await _context.InventoryTransactions.FindAsync(id);
            if (transaction == null)
                return NotFound();

            var batch = await _context.InventoryBatches.FindAsync(transaction.BatchId);
            if (batch != null)
                batch.QuantityInStock -= transaction.QuantityChange;

            _context.InventoryTransactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transaction deleted and stock adjusted." });
        }
    }
}
