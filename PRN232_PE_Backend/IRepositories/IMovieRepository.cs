using PRN232_PE_Backend.DTO.Request;
using PRN232_PE_Backend.Models;

namespace PRN232_PE_Backend.IRepositories;

public interface IMovieRepository
{
    Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesAsync(MovieQueryRequestDto query);
    Task<Movie?> GetByIdAsync(string id);
    Task<Movie> CreateAsync(Movie movie);
    Task<(Movie? Movie, bool WasModified)> UpdateAsync(string id, Movie movie);
    Task<bool> DeleteAsync(string id);
}


