using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.DTOs.Role;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public RolesController (ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Roles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleReadDTO>>> GetRoles()
        {
            var roles = await _context.Roles.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<RoleReadDTO>>(roles));
        }

        // GET: api/Roles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleReadDTO>> GetRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
                return NotFound();

            return Ok(_mapper.Map<RoleReadDTO>(role));
        }
    }
}
