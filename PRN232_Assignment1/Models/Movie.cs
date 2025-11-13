using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PRN232_PE_Backend.Models;

public class Movie
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRequired]
    public string Title { get; set; } = string.Empty;

    public string? Genre { get; set; }

    public int? Rating { get; set; }

    public string? PosterImage { get; set; }

    public string? PosterImageKey { get; set; }
}
