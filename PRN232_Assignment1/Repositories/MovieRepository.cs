using System.Text.RegularExpressions;
using MongoDB.Bson;
using MongoDB.Driver;
using PRN232_PE_Backend.Data;
using PRN232_PE_Backend.DTO.Request;
using PRN232_PE_Backend.IRepositories;
using PRN232_PE_Backend.Models;
using SortDirection = PRN232_PE_Backend.DTO.Request.SortDirection;

namespace PRN232_PE_Backend.Repositories;

public class MovieRepository : IMovieRepository
{
    private readonly IMongoCollection<Movie> _movies;

    public MovieRepository(MovieContext context)
    {
        _movies = context.Movies;
    }

    public async Task<(IEnumerable<Movie> Movies, int TotalCount)> GetMoviesAsync(MovieQueryRequestDto query)
    {
        var filter = BuildFilter(query);
        var sort = BuildSort(query);

        var totalCount = await _movies.CountDocumentsAsync(filter);

        var movies = await _movies
            .Find(filter)
            .Sort(sort)
            .Skip((query.Page - 1) * query.PageSize)
            .Limit(query.PageSize)
            .ToListAsync();

        return (movies, (int)totalCount);
    }

    public async Task<Movie?> GetByIdAsync(string id)
    {
        return await _movies.Find(m => m.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Movie> CreateAsync(Movie movie)
    {
        await _movies.InsertOneAsync(movie);
        return movie;
    }

    public async Task<(Movie? Movie, bool WasModified)> UpdateAsync(string id, Movie movie)
    {
        movie.Id = id;
        var result = await _movies.ReplaceOneAsync(m => m.Id == id, movie);
        if (!result.IsAcknowledged || result.MatchedCount == 0)
        {
            return (null, false);
        }

        return (movie, result.ModifiedCount > 0);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _movies.DeleteOneAsync(m => m.Id == id);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }

    private static FilterDefinition<Movie> BuildFilter(MovieQueryRequestDto query)
    {
        var filterBuilder = Builders<Movie>.Filter;
        var filters = new List<FilterDefinition<Movie>>();

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            filters.Add(filterBuilder.Regex(m => m.Title,
                new BsonRegularExpression(query.SearchTerm, "i")));
        }

        if (!string.IsNullOrWhiteSpace(query.Genre))
        {
            var escapedGenre = Regex.Escape(query.Genre);
            filters.Add(filterBuilder.Regex(m => m.Genre,
                new BsonRegularExpression($"^{escapedGenre}$", "i")));
        }

        return filters switch
        {
            { Count: 0 } => filterBuilder.Empty,
            { Count: 1 } => filters[0],
            _ => filterBuilder.And(filters)
        };
    }

    private static SortDefinition<Movie> BuildSort(MovieQueryRequestDto query)
    {
        var sortBuilder = Builders<Movie>.Sort;

        return query.SortBy switch
        {
            MovieSortBy.Rating => query.SortDirection == SortDirection.Descending
                ? sortBuilder.Descending(m => m.Rating)
                : sortBuilder.Ascending(m => m.Rating),
            _ => query.SortDirection == SortDirection.Descending
                ? sortBuilder.Descending(m => m.Title)
                : sortBuilder.Ascending(m => m.Title)
        };
    }
}


