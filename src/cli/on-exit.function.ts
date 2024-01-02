export function onExit(cb: (signal: NodeJS.Signals) => Promise<void> | void): void {
  process.once('SIGINT', (signal) => void cb(signal));
  process.once('SIGTERM', (signal) => void cb(signal));
  process.once('SIGUSR1', (signal) => void cb(signal));
  process.once('SIGUSR2', (signal) => void cb(signal));
}
