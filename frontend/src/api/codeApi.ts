import { apiRequest } from './httpClient';

export interface CodeExecutionRequestDto {
  code: string;
  language?: string;
  input?: string;
}

export interface CodeExecutionResponseDto {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

export function executeCode(payload: CodeExecutionRequestDto) {
  return apiRequest<CodeExecutionResponseDto>('/api/code/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: 30000,
  });
}
