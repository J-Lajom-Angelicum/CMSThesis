using Thesis.Models;
using AutoMapper;
using Thesis.DTOs.Patient;
using Thesis.DTOs.Appointment;
using Thesis.DTOs.ConsultationInventory;
using Thesis.DTOs.Consultation;
using Thesis.DTOs.Doctor;
using Thesis.DTOs.InventoryBatch;
using Thesis.DTOs.InventoryItem;
using Thesis.DTOs.LabOrder;
using Thesis.DTOs.LabResult;
using Thesis.DTOs.Payment;
using Thesis.DTOs.QueueEntry;
using Thesis.DTOs.Role;
using Thesis.DTOs.Staff;
using Thesis.DTOs.Supplier;
using Thesis.DTOs;
using Thesis.DTOs.User;

namespace Thesis.Mapping
{
    public class ThesisProfile : Profile
    {
        public ThesisProfile() 
        {
            CreateMap<Patient, PatientReadDTO>();
            CreateMap<PatientCreateDTO, Patient>();
            CreateMap<PatientUpdateDTO, Patient>();

            CreateMap<Appointment, AppointmentReadDTO>();
            CreateMap<AppointmentUpdateDTO, Appointment>();
            CreateMap<AppointmentCreateDTO, Appointment>();

            CreateMap<Consultation, ConsultationReadDTO>();
            CreateMap<ConsultationCreateDTO, Consultation>();
            CreateMap<ConsultationUpdateDTO, Consultation>();

            CreateMap<ConsultationInventory, ConsultationInventoryReadDTO>();
            CreateMap<ConsultationInventoryCreateDTO, ConsultationInventory>();
            CreateMap<ConsultationInventoryUpdateDTO, ConsultationInventory>();

            CreateMap<Doctor, DoctorReadDTO>();
            CreateMap<DoctorCreateDTO, Doctor>();
            CreateMap<DoctorUpdateDTO, Doctor>();

            CreateMap<InventoryBatch, InventoryBatchReadDTO>();
            CreateMap<InventoryBatchCreateDTO,  InventoryBatch>();
            CreateMap<InventoryBatchUpdateDTO, InventoryBatch>();

            CreateMap<InventoryItem, InventoryItemReadDTO>();
            CreateMap<InventoryItemCreateDTO, InventoryItem>();
            CreateMap<InventoryItemUpdateDTO, InventoryItem>();

            CreateMap<LabOrder, LabOrderReadDTO>();
            CreateMap<LabOrderCreateDTO, LabOrder>();
            CreateMap<LabOrderUpdateDTO, LabOrder>();

            CreateMap<LabResult, LabResultReadDTO>();
            CreateMap<LabResultCreateDTO, LabResult>();
            CreateMap<LabResultUpdateDTO, LabResult>();

            CreateMap<Payment, PaymentReadDTO>();
            CreateMap<PaymentCreateDTO, Payment>();
            CreateMap<PaymentUpdateDTO, Payment>();

            CreateMap<QueueEntry, QueueEntryReadDTO>();
            CreateMap<QueueEntryCreateDTO, QueueEntry>();
            CreateMap<QueueEntryUpdateDTO, QueueEntry>();

            CreateMap<Role, RoleReadDTO>();

            CreateMap<Staff, StaffReadDTO>();
            CreateMap<StaffCreateDTO,  Staff>();
            CreateMap<StaffUpdateDTO, Staff>();

            CreateMap<Supplier, SupplierReadDTO>();
            CreateMap<SupplierCreateDTO, Supplier>();
            CreateMap<SupplierUpdateDTO, Supplier>();

            CreateMap<User, UserReadDTO>();
            CreateMap<UserCreateDTO, User>();
            CreateMap<UserUpdateDTO, User>();
        }
    }
}
