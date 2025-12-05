export function onExit(callback: (signal: NodeJS.Signals) => Promise<void> | void): void {
  process.once('SIGINT', (signal) => void callback(signal));
  process.once('SIGTERM', (signal) => void callback(signal));
  process.once('SIGUSR1', (signal) => void callback(signal));
  process.once('SIGUSR2', (signal) => void callback(signal));
}
