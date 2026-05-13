type LogData = Record<string, unknown>;

function entry(level: string, msg: string, data?: LogData) {
  return JSON.stringify({ level, msg, ...data, ts: new Date().toISOString() });
}

export const logger = {
  info(msg: string, data?: LogData) {
    console.log(entry("info", msg, data));
  },
  warn(msg: string, data?: LogData) {
    console.warn(entry("warn", msg, data));
  },
  error(msg: string, error?: unknown, data?: LogData) {
    const err = error instanceof Error
      ? { message: error.message, stack: process.env.NODE_ENV !== "production" ? error.stack : undefined }
      : { message: String(error) };
    console.error(entry("error", msg, { err, ...data }));
  },
};
