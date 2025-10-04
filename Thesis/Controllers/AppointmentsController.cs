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
    public class AppointmentsController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public AppointmentsController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Appointment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppointmentReadDTO>>> GetAppointments()
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<AppointmentReadDTO>>(appointment));
        }

        // GET: api/Appointments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AppointmentReadDTO>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound();

            return Ok(_mapper.Map<AppointmentReadDTO>(appointment));
        }

        // POST: api/Appointments
        [HttpPost]
        public async Task<ActionResult<AppointmentReadDTO>> CreateAppointment([FromBody]AppointmentCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            //Check if Patient Exists
            var patient = await _context.Patients.FindAsync(dto.PatientId);
            if (patient == null)
                return NotFound($"Patient with ID {dto.PatientId} not found.");

            //Check if doctor exists
            var doctor = await _context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null)
                return NotFound($"Doctor with ID {dto.DoctorId} not found.");

            //Validate date
            if (dto.AppointmentDateTime < DateTime.Now)
                return BadRequest("Appointment Date cannot be in the past.");


            var appointment = _mapper.Map<Appointment>(dto);
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var readDTO = _mapper.Map<AppointmentReadDTO>(appointment);
            return CreatedAtAction(nameof(GetAppointment), new {id = appointment.AppointmentId},  readDTO);
        }


        //PUT: api/Appointments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, AppointmentUpdateDTO dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
                return NotFound();

            _mapper.Map(dto, appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Delete: api/Appointments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
                return NotFound();

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
