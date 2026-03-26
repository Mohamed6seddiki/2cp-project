using backend.DTOs;
using backend.Models;
using System.Diagnostics;
using System.Text;
using Microsoft.Extensions.Options;
using IHostEnvironment = Microsoft.Extensions.Hosting.IHostEnvironment;

namespace backend.Services;

public sealed class CodeExecutionService : ICodeExecutionService
{
    private readonly MyAlgoOptions _options;
    private readonly IHostEnvironment _hostEnvironment;

    public CodeExecutionService(IOptions<MyAlgoOptions> options, IHostEnvironment hostEnvironment)
    {
        _options = options.Value;
        _hostEnvironment = hostEnvironment;
    }

    public async Task<CodeExecutionResponseDto> ExecuteAsync(CodeExecutionRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Code))
        {
            return new CodeExecutionResponseDto
            {
                Success = false,
                ExitCode = -1,
                Stderr = "Code payload is empty."
            };
        }

        var cliPath = ResolveCliPath(_options.CliPath);
        if (!File.Exists(cliPath))
        {
            return new CodeExecutionResponseDto
            {
                Success = false,
                ExitCode = -1,
                Stderr = $"MyAlgo CLI not found at '{cliPath}'."
            };
        }

        var timeoutMs = _options.TimeoutMs <= 0 ? 10000 : _options.TimeoutMs;
        var workingDir = Path.Combine(Path.GetTempPath(), $"myalgo-run-{Guid.NewGuid():N}");
        Directory.CreateDirectory(workingDir);

        var sourcePath = Path.Combine(workingDir, "program.algo");
        await File.WriteAllTextAsync(sourcePath, request.Code, Encoding.UTF8, cancellationToken);

        var stdout = new StringBuilder();
        var stderr = new StringBuilder();
        var stopwatch = Stopwatch.StartNew();

        try
        {
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = cliPath,
                    Arguments = $"\"{sourcePath}\"",
                    WorkingDirectory = workingDir,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    RedirectStandardInput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            process.OutputDataReceived += (_, eventArgs) =>
            {
                if (eventArgs.Data is not null)
                {
                    stdout.AppendLine(eventArgs.Data);
                }
            };

            process.ErrorDataReceived += (_, eventArgs) =>
            {
                if (eventArgs.Data is not null)
                {
                    stderr.AppendLine(eventArgs.Data);
                }
            };

            if (!process.Start())
            {
                return new CodeExecutionResponseDto
                {
                    Success = false,
                    ExitCode = -1,
                    Stderr = "Failed to start MyAlgo process."
                };
            }

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            if (!string.IsNullOrEmpty(request.Input))
            {
                await process.StandardInput.WriteAsync(request.Input);
            }

            process.StandardInput.Close();

            using var timeoutCts = new CancellationTokenSource(timeoutMs);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            try
            {
                await process.WaitForExitAsync(linkedCts.Token);
            }
            catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested)
            {
                try
                {
                    if (!process.HasExited)
                    {
                        process.Kill(entireProcessTree: true);
                    }
                }
                catch
                {
                    // Ignore kill exceptions, timeout is already final outcome.
                }

                stopwatch.Stop();
                return new CodeExecutionResponseDto
                {
                    Success = false,
                    ExitCode = -1,
                    Stdout = stdout.ToString().TrimEnd(),
                    Stderr = $"Execution timed out after {timeoutMs} ms.",
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds
                };
            }

            stopwatch.Stop();

            return new CodeExecutionResponseDto
            {
                Success = process.ExitCode == 0,
                ExitCode = process.ExitCode,
                Stdout = stdout.ToString().TrimEnd(),
                Stderr = stderr.ToString().TrimEnd(),
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            return new CodeExecutionResponseDto
            {
                Success = false,
                ExitCode = -1,
                Stdout = stdout.ToString().TrimEnd(),
                Stderr = ex.Message,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds
            };
        }
        finally
        {
            try
            {
                if (Directory.Exists(workingDir))
                {
                    Directory.Delete(workingDir, recursive: true);
                }
            }
            catch
            {
                // Best effort cleanup.
            }
        }
    }

    private string ResolveCliPath(string configuredPath)
    {
        if (string.IsNullOrWhiteSpace(configuredPath))
        {
            return string.Empty;
        }

        if (Path.IsPathRooted(configuredPath))
        {
            return configuredPath;
        }

        return Path.GetFullPath(Path.Combine(_hostEnvironment.ContentRootPath, configuredPath));
    }
}
