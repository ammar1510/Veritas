type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVEL_ORDER: Record<Exclude<LogLevel, 'silent'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const resolveLevel = (): LogLevel => {
  const envLevel = (import.meta.env.VITE_LOG_LEVEL as string | undefined)?.toLowerCase();
  if (envLevel && (envLevel in LOG_LEVEL_ORDER || envLevel === 'silent')) {
    return envLevel as LogLevel;
  }
  return import.meta.env.DEV ? 'debug' : 'warn';
};

const activeLevel = resolveLevel();

const shouldLog = (level: LogLevel) => {
  if (activeLevel === 'silent' || level === 'silent') {
    return false;
  }
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[activeLevel];
};

const emit = (level: LogLevel, ...messages: unknown[]) => {
  if (!shouldLog(level)) {
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;
  if (level === 'debug' && typeof console.debug === 'function') {
    console.debug(prefix, ...messages);
    return;
  }

  if (level === 'info') {
    console.log(prefix, ...messages);
    return;
  }

  if (level === 'warn' || level === 'error') {
    console[level](prefix, ...messages);
  }
};

export const logger = {
  debug: (...messages: unknown[]) => emit('debug', ...messages),
  info: (...messages: unknown[]) => emit('info', ...messages),
  warn: (...messages: unknown[]) => emit('warn', ...messages),
  error: (...messages: unknown[]) => emit('error', ...messages),
};

export type Logger = typeof logger;
