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
            var staffs = await _context.Staff.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<StaffReadDTO>>(staffs));
        }

        // GET: api/Staffs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffReadDTO>> GetStaff(int id)
        {
            var staff = await _context.Staff.FindAsync(id);

            if (staff == null)
                return NotFound();

            return Ok(_mapper.Map<StaffReadDTO>(staff));
        }


        // POST: api/Staffs
        [HttpPost]
        public async Task<ActionResult<StaffReadDTO>> CreateStaff(StaffCreateDTO dto)
        {
            var staff = _mapper.Map<Staff>(dto);
            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<StaffReadDTO>(staff);
            return CreatedAtAction(nameof(GetStaff), new { id = staff.StaffId }, readDto);
        }

        // PUT: api/Staffs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(int id, StaffUpdateDTO dto)
        {
            var staff = await _context.Staff.FindAsync(id);

            if (staff == null)
                return NotFound();

            _mapper.Map(dto, staff);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Staffs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            var staff = await _context.Staff.FindAsync(id);

            if (staff == null)
                return NotFound();

            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
