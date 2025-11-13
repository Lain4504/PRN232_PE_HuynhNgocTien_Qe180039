using Microsoft.AspNetCore.Http;
using PRN232_PE_Backend.DTO.Request;
using PRN232_PE_Backend.DTO.Response;

namespace PRN232_PE_Backend.IServices;

public interface IMovieService
{
    Task<PaginatedResponseDto<MovieResponseDto>> GetMoviesAsync(MovieQueryRequestDto query);
    Task<MovieResponseDto?> GetByIdAsync(string id);
    Task<MovieResponseDto> CreateAsync(MovieRequestDto movieDto, IFormFile? posterImage);
    Task<(MovieResponseDto? Movie, bool WasModified)> UpdateAsync(string id, MovieRequestDto movieDto, IFormFile? posterImage);
    Task<bool> DeleteAsync(string id);
}


