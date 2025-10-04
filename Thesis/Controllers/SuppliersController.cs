using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Thesis.DTOs.Supplier;
using Thesis.Models;
using Microsoft.EntityFrameworkCore;

namespace Thesis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly ThesisContext _context;
        private readonly IMapper _mapper;

        public SuppliersController(ThesisContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        // GET: api/Suppliers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierReadDTO>>> GetSuppliers()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<SupplierReadDTO>>(suppliers));
        }

        // GET: api/Suppliers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierReadDTO>> GetSupplier(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
                return NotFound();

            return Ok(_mapper.Map<SupplierReadDTO>(supplier));
        }


        // POST: api/Suppliers
        [HttpPost]
        public async Task<ActionResult<SupplierReadDTO>> CreateSupplier(SupplierCreateDTO dto)
        {
            var supplier = _mapper.Map<Supplier>(dto);
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            var readDto = _mapper.Map<SupplierReadDTO>(supplier);
            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.SupplierId }, readDto);
        }

        // PUT: api/Suppliers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, SupplierUpdateDTO dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
                return NotFound();

            _mapper.Map(dto, supplier);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Suppliers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
                return NotFound();

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
