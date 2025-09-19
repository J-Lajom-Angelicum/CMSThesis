using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.User;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;
using Thesis.DTOs;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public UsersController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserReadDTO>>> GetUsers()
        {
            var Users = await _context.Users.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<UserReadDTO>>(Users));
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserReadDTO>> GetUser(int id)
        {
            var User = await _context.Users.FindAsync(id);

            if (User == null)
                return NotFound();

            return Ok(_mapper.Map<UserReadDTO>(User));
        }


        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserReadDTO>> CreateUser(UserCreateDTO dto)
        {
            var User = _mapper.Map<User>(dto);
            _context.Users.Add(User);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<UserReadDTO>(User);
            return CreatedAtAction(nameof(GetUser), new { id = User.UserId }, readDto);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDTO dto)
        {
            var User = await _context.Users.FindAsync(id);

            if (User == null)
                return NotFound();

            _mapper.Map(dto, User);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var User = await _context.Users.FindAsync(id);

            if (User == null)
                return NotFound();

            _context.Users.Remove(User);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
