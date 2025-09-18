using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.Staff;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public StaffController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Staffs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffReadDTO>>> GetStaffs()
        {
            var Staffs = await _context.Staff.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<StaffReadDTO>>(Staffs));
        }

        // GET: api/Staffs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffReadDTO>> GetStaff(int id)
        {
            var Staff = await _context.Staff.FindAsync(id);

            if (Staff == null)
                return NotFound();

            return Ok(_mapper.Map<StaffReadDTO>(Staff));
        }


        // POST: api/Staffs
        [HttpPost]
        public async Task<ActionResult<StaffReadDTO>> CreateStaff(StaffCreateDTO dto)
        {
            var Staff = _mapper.Map<Staff>(dto);
            _context.Staff.Add(Staff);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<StaffReadDTO>(Staff);
            return CreatedAtAction(nameof(GetStaff), new { id = Staff.StaffId }, readDto);
        }

        // PUT: api/Staffs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, StaffUpdateDTO dto)
        {
            var Staff = await _context.Staff.FindAsync(id);

            if (Staff == null)
                return NotFound();

            _mapper.Map(dto, Staff);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Staffs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var Staff = await _context.Staff.FindAsync(id);

            if (Staff == null)
                return NotFound();

            _context.Staff.Remove(Staff);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
