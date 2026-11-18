// Globals set by plain scripts, outside the modules (types only, not served).
interface Window {
  /** set by stats.js where the statistics can be sent: events wait for them in a queue */
  automaStats?: boolean;
  /** set by stats.js: gives the first page view the address it came with, campaign parameters included */
  automaStatsBeforeSend?: (type: string, payload: { name?: string, url?: string }) => object;
  /** the Umami tracker, once stats.js has loaded it */
  umami?: { track(name: string, data?: Record<string, string | number | boolean>): unknown };
}
