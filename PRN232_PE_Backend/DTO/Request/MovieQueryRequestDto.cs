using System.ComponentModel.DataAnnotations;

namespace PRN232_PE_Backend.DTO.Request;

public class MovieQueryRequestDto
{
    public string? SearchTerm { get; set; }

    public string? Genre { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize { get; set; } = 10;

    public MovieSortBy SortBy { get; set; } = MovieSortBy.Title;

    public SortDirection SortDirection { get; set; } = SortDirection.Ascending;
}

public enum MovieSortBy
{
    Title,
    Rating
}

public enum SortDirection
{
    Ascending,
    Descending
}


