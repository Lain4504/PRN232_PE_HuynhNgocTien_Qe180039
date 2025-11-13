using Microsoft.AspNetCore.Http;

namespace PRN232_PE_Backend.IServices;

public interface ICloudflareService
{
    Task<string> UploadImageAsync(IFormFile imageFile, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
}

