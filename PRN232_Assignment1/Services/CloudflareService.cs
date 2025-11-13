using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using PRN232_PE_Backend.IServices;

namespace PRN232_PE_Backend.Services;

public class CloudflareService : ICloudflareService
{
    private readonly string _accountId;
    private readonly string _accessKey;
    private readonly string _accessSecret;
    private readonly string _bucketName;
    private readonly string _publicUrl;
    private const int MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/png", "image/webp" };
    
    public CloudflareService(IConfiguration configuration)
    {
        _accountId = configuration["R2:AccountId"];
        _accessKey = configuration["R2:AccessKey"];
        _accessSecret = configuration["R2:SecretKey"];
        _bucketName = configuration["R2:BucketName"];
        _publicUrl = configuration["R2:PublicUrl"];
    }
     
    public async Task<string> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default)
    {  
        ValidateImage(file);
        var uniqueFileName = GenerateUniqueFileName(file.FileName);
        
        var credentials = new BasicAWSCredentials(_accessKey, _accessSecret);

        using var s3Client = new AmazonS3Client(
            credentials,
            new AmazonS3Config
            {
                ServiceURL = $"https://{_accountId}.r2.cloudflarestorage.com",
                SignatureVersion = "3",
            });

        using var stream = file.OpenReadStream();
            
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = uniqueFileName,
            InputStream = stream,
            ContentType = file.ContentType,
            DisablePayloadSigning = true
        };

        var response = await s3Client.PutObjectAsync(request, cancellationToken);

        if (response.HttpStatusCode != System.Net.HttpStatusCode.OK &&
            response.HttpStatusCode != System.Net.HttpStatusCode.Accepted)
        {
            throw new Exception("Upload to Cloudflare R2 failed");
        }

        return $"{_publicUrl}/{uniqueFileName}";
    }
  
    public async Task DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        // Extract filename from URL (e.g., "https://pub-f9fde820e02a4976b08ee6caab4a7c92.r2.dev/filename.jpg" -> "filename.jpg")
        var fileName = imageUrl.Contains('/') ? imageUrl.Split('/').Last() : imageUrl;
        
        var credentials = new BasicAWSCredentials(_accessKey, _accessSecret);
        using var s3Client = new AmazonS3Client(
            credentials,
            new AmazonS3Config
            {
                ServiceURL = $"https://{_accountId}.r2.cloudflarestorage.com",
                SignatureVersion = "3",
            });

        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = fileName,
        };

        await s3Client.DeleteObjectAsync(request, cancellationToken);
    }

    private static string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var guid = Guid.NewGuid().ToString("N")[..8]; // Take first 8 characters
        
        return $"{fileNameWithoutExtension}_{timestamp}_{guid}{extension}";
    }

    private static void ValidateImage(IFormFile file)
    {
        if (file.Length > MaxFileSizeInBytes)
        {
            throw new ArgumentException("File size exceeds the maximum allowed limit of 5MB.");
        }

        if (Array.IndexOf(AllowedMimeTypes, file.ContentType) < 0)
        {
            throw new ArgumentException("Unsupported file type. Only JPEG, PNG, and WEBP are allowed.");
        }
    }
}
