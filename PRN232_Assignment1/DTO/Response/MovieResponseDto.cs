namespace PRN232_PE_Backend.DTO.Response;

public class MovieResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Genre { get; set; }
    public int? Rating { get; set; }
    public string? PosterImage { get; set; }
}


