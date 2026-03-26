namespace backend.Supabase;

public interface ISupabaseClientFactory
{
    Task<global::Supabase.Client> GetClientAsync(CancellationToken cancellationToken = default);
}
