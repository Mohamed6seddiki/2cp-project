using System.Text.Json;
using backend.DTOs.Common;
using backend.Models;
using backend.Middleware;
using backend.Services;
using backend.Supabase;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "The value is invalid."
                        : error.ErrorMessage)
                    .ToArray());

        var response = new backend.DTOs.Common.ApiErrorDto
        {
            Status = StatusCodes.Status400BadRequest,
            Code = "validation_failed",
            Message = "One or more validation errors occurred.",
            TraceId = context.HttpContext.TraceIdentifier,
            Errors = errors
        };

        return new BadRequestObjectResult(response);
    };
});
builder.Services.Configure<SupabaseOptions>(
    builder.Configuration.GetSection(SupabaseOptions.SectionName));
builder.Services.Configure<MyAlgoOptions>(
    builder.Configuration.GetSection(MyAlgoOptions.SectionName));
builder.Services.Configure<AuthOptions>(
    builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.AddSingleton<ISupabaseClientFactory, SupabaseClientFactory>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IExerciseService, ExerciseService>();
builder.Services.AddScoped<ICodeExecutionService, CodeExecutionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IStudentDashboardService, StudentDashboardService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<ILessonCompletionService, LessonCompletionService>();
builder.Services.AddScoped<IAdminLessonService, AdminLessonService>();
builder.Services.AddScoped<IAdminExerciseService, AdminExerciseService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IClaimsTransformation, AppUserClaimsTransformation>();
builder.Services.AddHttpClient();

var supabaseUrl = builder.Configuration[$"{SupabaseOptions.SectionName}:Url"];
var supabaseServiceKey = builder.Configuration[$"{SupabaseOptions.SectionName}:ServiceKey"];
var jwtAudience = builder.Configuration[$"{AuthOptions.SectionName}:JwtAudience"] ?? "authenticated";
var jwtIssuer = $"{supabaseUrl?.TrimEnd('/')}/auth/v1";
var jwtMetadataAddress = $"{jwtIssuer}/.well-known/openid-configuration";
var jwtJwksAddress = $"{jwtIssuer}/.well-known/jwks.json";

if (string.IsNullOrWhiteSpace(supabaseUrl))
{
    throw new InvalidOperationException(
        "Supabase URL is missing. Configure 'Supabase:Url' in appsettings, user secrets, or environment variable 'Supabase__Url'.");
}

if (string.IsNullOrWhiteSpace(supabaseServiceKey))
{
    throw new InvalidOperationException(
        "Supabase API key is missing. Configure 'Supabase:ServiceKey' in appsettings, user secrets, or environment variable 'Supabase__ServiceKey'.");
}

using var jwtBackchannelClient = new HttpClient();
var jwksPayload = await jwtBackchannelClient.GetStringAsync(jwtJwksAddress);
var signingKeys = new JsonWebKeySet(jwksPayload).GetSigningKeys();

if (signingKeys.Count == 0)
{
    throw new InvalidOperationException("No Supabase JWT signing keys were found.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = jwtIssuer;
        options.MetadataAddress = jwtMetadataAddress;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = signingKeys,
            ValidateLifetime = true
        };
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var payload = new ApiErrorDto
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Code = "unauthorized",
                    Message = "Authentication is required.",
                    TraceId = context.HttpContext.TraceIdentifier
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var payload = new ApiErrorDto
                {
                    Status = StatusCodes.Status403Forbidden,
                    Code = "forbidden",
                    Message = "You do not have access to this resource.",
                    TraceId = context.HttpContext.TraceIdentifier
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto |
        ForwardedHeaders.XForwardedHost;

    if (builder.Environment.IsDevelopment())
    {
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    }
});

var configuredCorsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Select(origin => (origin ?? string.Empty).Trim().TrimEnd('/'))
    .Where(origin =>
        !string.IsNullOrWhiteSpace(origin)
        && Uri.TryCreate(origin, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray()
    ?? [];

if (configuredCorsOrigins.Length == 0)
{
    configuredCorsOrigins =
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ];
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins(configuredCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SupportNonNullableReferenceTypes();
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Algonova Backend API",
        Version = "v1",
        Description = "Algonova API for lessons, exercises, code execution, and auth."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

app.UseHttpsRedirection();

app.UseCors("FrontendDev");

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
