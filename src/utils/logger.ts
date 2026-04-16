type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

type LogContext = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const readLogLevel = (): LogLevel => {
  const rawLevel = (import.meta.env.VITE_LOG_LEVEL || 'info').toLowerCase();
  if (rawLevel === 'debug' || rawLevel === 'info' || rawLevel === 'warn' || rawLevel === 'error' || rawLevel === 'silent') {
    return rawLevel;
  }
  return 'info';
};

const activeLevel = readLogLevel();

const shouldLog = (level: LogLevel): boolean => {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[activeLevel];
};

const toIsoNow = (): string => new Date().toISOString();

const write = (level: LogLevel, message: string, context?: LogContext, error?: unknown): void => {
  if (!shouldLog(level)) return;

  const prefix = `[ENROLMENT-FE][${level.toUpperCase()}][${toIsoNow()}] ${message}`;

  if (level === 'error') {
    if (context && error !== undefined) {
      console.error(prefix, context, error);
      return;
    }
    if (context) {
      console.error(prefix, context);
      return;
    }
    console.error(prefix, error);
    return;
  }

  if (level === 'warn') {
    context ? console.warn(prefix, context) : console.warn(prefix);
    return;
  }

  if (level === 'info') {
    context ? console.info(prefix, context) : console.info(prefix);
    return;
  }

  context ? console.debug(prefix, context) : console.debug(prefix);
};

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext, error?: unknown) => write('error', message, context, error),
};
