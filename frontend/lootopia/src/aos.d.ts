declare module 'aos' {
  interface AosOptions {
    duration?: number;
    once?: boolean;
    easing?: string;
    offset?: number;
    delay?: number;
  }
  function init(options?: AosOptions): void;
  function refresh(): void;
  export default { init, refresh };
}
