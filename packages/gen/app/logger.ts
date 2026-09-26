import { Readable, Writable } from "node:stream";

export interface LoggingService {
  error: (message: string, opts?: LogServiceOptions) => void;
  info: (message: string, opts?: LogServiceOptions) => void;
  message: (
    message?: string | string[],
    { output, secondarySymbol, spacing, symbol, withGuide }?: LogServiceOptions,
  ) => void;
  step: (message: string, opts?: LogServiceOptions) => void;
  success: (message: string, opts?: LogServiceOptions) => void;
  warn: (message: string, opts?: LogServiceOptions) => void;
  warning: (message: string, opts?: LogServiceOptions) => void;
}

type LogServiceOptions = {
  input: Readable;
  output: Writable;
  secondarySymbol: string;
  signal: AbortSignal;
  spacing: number;
  symbol: string;
  withGuide: boolean;
};
