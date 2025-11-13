using MongoDB.Driver;
using DotNetEnv;
using PRN232_PE_Backend.IServices;
using PRN232_PE_Backend.Repositories;
using PRN232_PE_Backend.IRepositories;
using PRN232_PE_Backend.Services;
using PRN232_PE_Backend.Data;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// MongoDB Configuration
var mongoDbSettings = builder.Configuration.GetSection("MongoDB");
var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") ?? mongoDbSettings["ConnectionString"];
var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME") ?? mongoDbSettings["DatabaseName"];

builder.Services.AddSingleton<IMongoClient>(serviceProvider => 
    new MongoClient(connectionString));

builder.Services.AddSingleton<MovieContext>(serviceProvider =>
{
    var mongoClient = serviceProvider.GetRequiredService<IMongoClient>();
    return new MovieContext(mongoClient, databaseName);
});

// Cloudflare R2 configuration
var r2AccessKey = Environment.GetEnvironmentVariable("R2_ACCESS_KEY");
if (!string.IsNullOrWhiteSpace(r2AccessKey))
{
    builder.Configuration["R2:AccessKey"] = r2AccessKey;
}

var r2SecretKey = Environment.GetEnvironmentVariable("R2_SECRET_KEY");
if (!string.IsNullOrWhiteSpace(r2SecretKey))
{
    builder.Configuration["R2:SecretKey"] = r2SecretKey;
}

var r2AccountId = Environment.GetEnvironmentVariable("R2_ACCOUNT_ID");
if (!string.IsNullOrWhiteSpace(r2AccountId))
{
    builder.Configuration["R2:AccountId"] = r2AccountId;
}

var r2BucketName = Environment.GetEnvironmentVariable("R2_BUCKET_NAME");
if (!string.IsNullOrWhiteSpace(r2BucketName))
{
    builder.Configuration["R2:BucketName"] = r2BucketName;
}

var r2PublicUrl = Environment.GetEnvironmentVariable("R2_PUBLIC_URL");
if (!string.IsNullOrWhiteSpace(r2PublicUrl))
{
    builder.Configuration["R2:PublicUrl"] = r2PublicUrl;
}

var r2ServiceUrl = Environment.GetEnvironmentVariable("R2_SERVICE_URL");
if (!string.IsNullOrWhiteSpace(r2ServiceUrl))
{
    builder.Configuration["R2:ServiceUrl"] = r2ServiceUrl;
}

// Register repositories and services
builder.Services.AddScoped<IMovieRepository, MovieRepository>();
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddSingleton<ICloudflareService, CloudflareService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',') 
                           ?? new[] { "http://localhost:3000" };
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
