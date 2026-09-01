using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info = new()
        {
            Title = builder.Configuration["OpenApi:Title"],
            Version = builder.Configuration["OpenApi:Version"],
        };
        return Task.CompletedTask;
    });
 });
const string CorsPolicyName = "AppCorsPolicy";

// Fetch origins from configuration 
var rawOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

if (rawOrigins.Length == 0)
{
    throw new InvalidOperationException
        ("CORS configuration failure: 'Cors:AllowedOrigins' must contain at least one valid origin.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy.WithOrigins(rawOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10));    
    });
});

var app = builder.Build();

app.UseCors(CorsPolicyName); 

app.UseAuthorization();

app.MapControllers();
app.MapOpenApi();

app.Run();
