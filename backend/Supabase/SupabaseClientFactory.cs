using Microsoft.Extensions.Options;

namespace backend.Supabase;

public sealed class SupabaseClientFactory : ISupabaseClientFactory
{
    private readonly SupabaseOptions _options;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private global::Supabase.Client? _client;

    public SupabaseClientFactory(IOptions<SupabaseOptions> options)
    {
        _options = options.Value;
    }

    public async Task<global::Supabase.Client> GetClientAsync(CancellationToken cancellationToken = default)
    {
        if (_client is not null)
        {
            return _client;
        }

        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_client is not null)
            {
                return _client;
            }

            if (string.IsNullOrWhiteSpace(_options.Url) || string.IsNullOrWhiteSpace(_options.ServiceKey))
            {
                throw new InvalidOperationException("Supabase configuration is missing. Please set Supabase:Url and Supabase:ServiceKey.");
            }

            var supabaseOptions = new global::Supabase.SupabaseOptions();

            var client = new global::Supabase.Client(_options.Url, _options.ServiceKey, supabaseOptions);
            await client.InitializeAsync();
            _client = client;
            return _client;
        }
        finally
        {
            _lock.Release();
        }
    }
}
