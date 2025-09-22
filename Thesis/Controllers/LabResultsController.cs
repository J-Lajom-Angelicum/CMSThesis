using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.LabResult;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabResultsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public LabResultsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/LabResults
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LabResultReadDTO>>> GetLabResults()
        {
            var LabResults = await _context.LabResults.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<LabResultReadDTO>>(LabResults));
        }

        // GET: api/LabResults/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LabResultReadDTO>> GetLabResult(int id)
        {
            var LabResult = await _context.LabResults.FindAsync(id);

            if (LabResult == null)
                return NotFound();

            return Ok(_mapper.Map<LabResultReadDTO>(LabResult));
        }


        // POST: api/LabResults
        [HttpPost]
        public async Task<ActionResult<LabResultReadDTO>> CreateLabResult(LabResultCreateDTO dto)
        {
            var LabResult = _mapper.Map<LabResult>(dto);
            _context.LabResults.Add(LabResult);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<LabResultReadDTO>(LabResult);
            return CreatedAtAction(nameof(GetLabResult), new { id = LabResult.LabResultId }, readDto);
        }

        // PUT: api/LabResults/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLabResult(int id, LabResultUpdateDTO dto)
        {
            var LabResult = await _context.LabResults.FindAsync(id);

            if (LabResult == null)
                return NotFound();

            _mapper.Map(dto, LabResult);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/LabResults/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLabResult(int id)
        {
            var LabResult = await _context.LabResults.FindAsync(id);

            if (LabResult == null)
                return NotFound();

            _context.LabResults.Remove(LabResult);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
