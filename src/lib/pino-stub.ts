// Stub for pino logger to prevent build errors
// WalletConnect uses pino which has Node.js dependencies

const noop = (...args: any[]): void => {};

interface PinoLogger {
  fatal: typeof noop;
  error: typeof noop;
  warn: typeof noop;
  info: typeof noop;
  debug: typeof noop;
  trace: typeof noop;
  silent: typeof noop;
  child: (bindings?: any) => PinoLogger;
  level: string;
  levelVal: number;
  levels: any;
  [key: string]: any;
}

const createLogger = (): PinoLogger => {
  const logger: any = {
    fatal: noop,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    trace: noop,
    silent: noop,
    child: () => createLogger(),
    level: 'silent',
    levelVal: 100,
    levels: {
      values: { silent: 100 },
      labels: { 100: 'silent' }
    },
    isLevelEnabled: () => false,
    flush: noop,
  };
  return logger;
};

export const pino = (options?: any): PinoLogger => {
  return createLogger();
};

// Add default export and named exports
pino.destination = () => ({ write: noop });
pino.transport = () => ({ write: noop });
pino.multistream = () => ({ write: noop });
pino.levels = {
  values: { silent: 100 },
  labels: { 100: 'silent' }
};

export default pino;

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pino;
  module.exports.default = pino;
  module.exports.pino = pino;
}