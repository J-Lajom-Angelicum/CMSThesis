using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Thesis.DTOs.Appointment;
using Thesis.DTOs.Patient;
using Thesis.Models;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public AppointmentController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Appointment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentReadDTO>>> GetAppointments()
        {
            var appointment = await _context.Appointments.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<AppointmentReadDTO>>(appointment));
        }

        // get: api/Appointments/5
        [HttpGet("id")]
        public async Task<ActionResult<AppointmentReadDTO>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
                return NotFound();

            return Ok(_mapper.Map<AppointmentReadDTO>(appointment));
        }


    }
}
