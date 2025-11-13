using Microsoft.AspNetCore.Mvc;
using PRN232_PE_Backend.DTO;
using PRN232_PE_Backend.DTO.Request;
using PRN232_PE_Backend.DTO.Response;
using PRN232_PE_Backend.IServices;

namespace PRN232_PE_Backend.Controllers;

[ApiController]
[Route("api/movies")]
public class MovieController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MovieController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMovies([FromQuery] MovieQueryRequestDto query)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(GenericResponse<PaginatedResponseDto<MovieResponseDto>>.CreateValidationError(ExtractValidationErrors()));
        }

        try
        {
            var movies = await _movieService.GetMoviesAsync(query);
            return Ok(GenericResponse<PaginatedResponseDto<MovieResponseDto>>.CreateSuccess(movies, "Movies retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, GenericResponse<PaginatedResponseDto<MovieResponseDto>>.CreateError($"Error retrieving movies: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMovieById(string id)
    {
        try
        {
            var movie = await _movieService.GetByIdAsync(id);
            if (movie is null)
            {
                return NotFound(GenericResponse<MovieResponseDto>.CreateError("Movie not found", System.Net.HttpStatusCode.NotFound, "MOVIE_NOT_FOUND"));
            }

            return Ok(GenericResponse<MovieResponseDto>.CreateSuccess(movie, "Movie retrieved successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, GenericResponse<MovieResponseDto>.CreateError($"Error retrieving movie: {ex.Message}"));
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMovie([FromForm] MovieFormModel formModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(GenericResponse<MovieResponseDto>.CreateValidationError(ExtractValidationErrors()));
        }

        try
        {
            var movieDto = formModel.ToMovieRequestDto();
            var createdMovie = await _movieService.CreateAsync(movieDto, formModel.PosterImage);
            var response = GenericResponse<MovieResponseDto>.CreateSuccess(createdMovie, "Movie created successfully");
            return CreatedAtAction(nameof(GetMovieById), new { id = createdMovie.Id }, response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, GenericResponse<MovieResponseDto>.CreateError($"Error creating movie: {ex.Message}"));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMovie(string id, [FromForm] MovieFormModel formModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(GenericResponse<MovieResponseDto>.CreateValidationError(ExtractValidationErrors()));
        }

        try
        {
            var movieDto = formModel.ToMovieRequestDto();
            var (updatedMovie, wasModified) = await _movieService.UpdateAsync(id, movieDto, formModel.PosterImage);
            if (updatedMovie is null)
            {
                return NotFound(GenericResponse<MovieResponseDto>.CreateError("Movie not found", System.Net.HttpStatusCode.NotFound, "MOVIE_NOT_FOUND"));
            }

            var message = wasModified
                ? "Movie updated successfully"
                : "Movie found but no changes were made";

            return Ok(GenericResponse<MovieResponseDto>.CreateSuccess(updatedMovie, message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, GenericResponse<MovieResponseDto>.CreateError($"Error updating movie: {ex.Message}"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMovie(string id)
    {
        try
        {
            var deleted = await _movieService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(GenericResponse<object>.CreateError("Movie not found", System.Net.HttpStatusCode.NotFound, "MOVIE_NOT_FOUND"));
            }

            return Ok(GenericResponse<object>.CreateSuccess("Movie deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, GenericResponse<object>.CreateError($"Error deleting movie: {ex.Message}"));
        }
    }

    private Dictionary<string, List<string>> ExtractValidationErrors()
    {
        var validationErrors = new Dictionary<string, List<string>>();
        foreach (var key in ModelState.Keys)
        {
            var errors = ModelState[key]?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>();
            if (errors.Any())
            {
                validationErrors[key] = errors;
            }
        }

        return validationErrors;
    }
}


