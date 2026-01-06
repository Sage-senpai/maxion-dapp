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

// Define levels that WalletConnect expects
export const levels = {
  values: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
    silent: 100
  },
  labels: {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
    100: 'silent'
  }
};

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
    levels,
    isLevelEnabled: () => false,
    flush: noop,
  };
  return logger;
};

export const pino = (options?: any): PinoLogger => {
  return createLogger();
};

// Add properties to pino function
pino.destination = () => ({ write: noop });
pino.transport = () => ({ write: noop });
pino.multistream = () => ({ write: noop });
pino.levels = levels;

export default pino;

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pino;
  module.exports.default = pino;
  module.exports.pino = pino;
  module.exports.levels = levels;
}