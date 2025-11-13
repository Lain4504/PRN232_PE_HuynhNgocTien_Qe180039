using Microsoft.AspNetCore.Http;
using PRN232_PE_Backend.DTO.Request;
using PRN232_PE_Backend.DTO.Response;
using PRN232_PE_Backend.IRepositories;
using PRN232_PE_Backend.IServices;
using PRN232_PE_Backend.Models;
using System.IO;

namespace PRN232_PE_Backend.Services;

public class MovieService : IMovieService
{
    private readonly IMovieRepository _movieRepository;
    private readonly ICloudflareService _cloudflareService;

    public MovieService(IMovieRepository movieRepository, ICloudflareService cloudflareService)
    {
        _movieRepository = movieRepository;
        _cloudflareService = cloudflareService;
    }

    public async Task<PaginatedResponseDto<MovieResponseDto>> GetMoviesAsync(MovieQueryRequestDto query)
    {
        var (movies, totalCount) = await _movieRepository.GetMoviesAsync(query);
        var movieDtos = movies.Select(MapToResponse).ToList();

        return new PaginatedResponseDto<MovieResponseDto>(movieDtos, query.Page, query.PageSize, totalCount);
    }

    public async Task<MovieResponseDto?> GetByIdAsync(string id)
    {
        var movie = await _movieRepository.GetByIdAsync(id);
        return movie is null ? null : MapToResponse(movie);
    }

    public async Task<MovieResponseDto> CreateAsync(MovieRequestDto movieDto, IFormFile? posterImage)
    {
        var movie = new Movie
        {
            Title = movieDto.Title.Trim(),
            Genre = string.IsNullOrWhiteSpace(movieDto.Genre) ? null : movieDto.Genre.Trim(),
            Rating = movieDto.Rating
        };

        if (posterImage is not null)
        {
            var imageUrl = await _cloudflareService.UploadImageAsync(posterImage);
            movie.PosterImage = imageUrl;
            movie.PosterImageKey = Path.GetFileName(imageUrl);
        }

        var createdMovie = await _movieRepository.CreateAsync(movie);
        return MapToResponse(createdMovie);
    }

    public async Task<(MovieResponseDto? Movie, bool WasModified)> UpdateAsync(string id, MovieRequestDto movieDto, IFormFile? posterImage)
    {
        var existing = await _movieRepository.GetByIdAsync(id);
        if (existing is null)
        {
            return (null, false);
        }

        existing.Title = movieDto.Title.Trim();
        existing.Genre = string.IsNullOrWhiteSpace(movieDto.Genre) ? null : movieDto.Genre.Trim();
        existing.Rating = movieDto.Rating;

        if (posterImage is not null)
        {
            if (!string.IsNullOrEmpty(existing.PosterImageKey))
            {
                await _cloudflareService.DeleteImageAsync(existing.PosterImageKey!);
            }

            var imageUrl = await _cloudflareService.UploadImageAsync(posterImage);
            existing.PosterImage = imageUrl;
            existing.PosterImageKey = Path.GetFileName(imageUrl);
        }

        var (updatedMovie, wasModified) = await _movieRepository.UpdateAsync(id, existing);
        return (updatedMovie is null ? null : MapToResponse(updatedMovie), wasModified);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var existing = await _movieRepository.GetByIdAsync(id);
        if (existing is null)
        {
            return false;
        }

        var deleted = await _movieRepository.DeleteAsync(id);
        if (deleted && !string.IsNullOrEmpty(existing.PosterImageKey))
        {
            await _cloudflareService.DeleteImageAsync(existing.PosterImageKey!);
        }

        return deleted;
    }

    private static MovieResponseDto MapToResponse(Movie movie)
    {
        return new MovieResponseDto
        {
            Id = movie.Id,
            Title = movie.Title,
            Genre = movie.Genre,
            Rating = movie.Rating,
            PosterImage = movie.PosterImage
        };
    }
}

