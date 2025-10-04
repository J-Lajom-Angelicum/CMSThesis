using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.QueueEntry;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QueueEntriesController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public QueueEntriesController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/QueueEntrys
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QueueEntryReadDTO>>> GetQueueEntrys()
        {
            var QueueEntrys = await _context.QueueEntries.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<QueueEntryReadDTO>>(QueueEntrys));
        }

        // GET: api/QueueEntrys/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QueueEntryReadDTO>> GetQueueEntry(int id)
        {
            var QueueEntry = await _context.QueueEntries.FindAsync(id);

            if (QueueEntry == null)
                return NotFound();

            return Ok(_mapper.Map<QueueEntryReadDTO>(QueueEntry));
        }


        // POST: api/QueueEntrys
        [HttpPost]
        public async Task<ActionResult<QueueEntryReadDTO>> CreateQueueEntry(QueueEntryCreateDTO dto)
        {
            var QueueEntry = _mapper.Map<QueueEntry>(dto);
            _context.QueueEntries.Add(QueueEntry);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<QueueEntryReadDTO>(QueueEntry);
            return CreatedAtAction(nameof(GetQueueEntry), new { id = QueueEntry.QueueEntryId }, readDto);
        }

        // PUT: api/QueueEntrys/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQueueEntry(int id, QueueEntryUpdateDTO dto)
        {
            var QueueEntry = await _context.QueueEntries.FindAsync(id);

            if (QueueEntry == null)
                return NotFound();

            _mapper.Map(dto, QueueEntry);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/QueueEntrys/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQueueEntry(int id)
        {
            var QueueEntry = await _context.QueueEntries.FindAsync(id);

            if (QueueEntry == null)
                return NotFound();

            _context.QueueEntries.Remove(QueueEntry);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
