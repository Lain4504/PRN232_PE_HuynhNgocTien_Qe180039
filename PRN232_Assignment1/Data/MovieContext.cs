using MongoDB.Driver;
using PRN232_PE_Backend.Models;

namespace PRN232_PE_Backend.Data;

public class MovieContext
{
    private readonly IMongoDatabase _database;

    public MovieContext(IMongoClient mongoClient, string databaseName)
    {
        _database = mongoClient.GetDatabase(databaseName);
    }

    public IMongoCollection<Movie> Movies => _database.GetCollection<Movie>("Movies");
}


