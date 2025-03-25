using AutoMapper;
using Pet.Dtos;
using Pet.Dtos.Account;
using Pet.Dtos.Category;
using Pet.Dtos.Role;
using Pet.Dtos.Supplier;
using Pet.Dtos.User;
using Pet.Models;

namespace Pet.Datas
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Role
            CreateMap<Role, RoleDto>();
            CreateMap<UpdateRoleDto, Role>();

            // User
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Category
            CreateMap<Category, CategoryDto>();
            CreateMap<UpdateCategoryDto, Category>();

            // Account
            CreateMap<RegisterDto, User>();
            CreateMap<UpdateProfileDto, User>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<User, ProfileDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth))
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.Gender.ToString()))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Image));

            // Supplier
            CreateMap<Supplier, SupplierDto>();
            CreateMap<CreateSupplierDto, Supplier>();
            CreateMap<UpdateSupplierDto, Supplier>();
        }
    }
}
