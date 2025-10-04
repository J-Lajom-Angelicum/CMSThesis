using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.InventoryItem;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryItemsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public InventoryItemsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/InventoryItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryItemReadDTO>>> GetInventoryItems()
        {
            var InventoryItems = await _context.InventoryItems
                .Include(i => i.Supplier) // ← Include supplier info
                .Include(i => i.InventoryBatches) // ← Include batches for stock calculation
                .ToListAsync();
            return Ok(_mapper.Map<IEnumerable<InventoryItemReadDTO>>(InventoryItems));
        }

        // GET: api/InventoryItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryItemReadDTO>> GetInventoryItem(int id)
        {
            var InventoryItem = await _context.InventoryItems
                .Include(i => i.Supplier)
                .Include(i => i.InventoryBatches)
                .FirstOrDefaultAsync(i => i.ItemId == id);

            if (InventoryItem == null)
                return NotFound();

            return Ok(_mapper.Map<InventoryItemReadDTO>(InventoryItem));
        }


        // POST: api/InventoryItems
        [HttpPost]
        public async Task<ActionResult<InventoryItemReadDTO>> CreateInventoryItem(InventoryItemCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check for duplicate item name
            var existingItem = await _context.InventoryItems
                .FirstOrDefaultAsync(i => i.ItemName.ToLower() == dto.ItemName.ToLower());

            if (existingItem != null)
                return BadRequest("An item with this name already exists.");

            if (dto.ReorderLevel < 0)
                return BadRequest("Reorder level cannot be negative.");

            if (dto.SupplierId.HasValue)
            {
                var supplierExists = await _context.Suppliers.AnyAsync(s => s.SupplierId == dto.SupplierId);
                if (!supplierExists)
                    return BadRequest("Invalid Supplier ID.");
            }

            var InventoryItem = _mapper.Map<InventoryItem>(dto);
            _context.InventoryItems.Add(InventoryItem);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<InventoryItemReadDTO>(InventoryItem);
            return CreatedAtAction(nameof(GetInventoryItem), new { id = InventoryItem.ItemId }, readDto);
        }

        // PUT: api/InventoryItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventoryItem(int id, InventoryItemUpdateDTO dto)
        {
            var InventoryItem = await _context.InventoryItems.FindAsync(id);

            if (InventoryItem == null)
                return NotFound();

            if (dto.ReorderLevel < 0)
                return BadRequest("Reorder level cannot be negative.");

            _mapper.Map(dto, InventoryItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/InventoryItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventoryItem(int id)
        {
            var InventoryItem = await _context.InventoryItems.FindAsync(id);

            if (InventoryItem == null)
                return NotFound();

            _context.InventoryItems.Remove(InventoryItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
