namespace backend.DTOs.Common;

public sealed class ApiErrorDto
{
    public int Status { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string TraceId { get; set; } = string.Empty;

    public IDictionary<string, string[]>? Errors { get; set; }
}
