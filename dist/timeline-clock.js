export class TimelineClock {
  constructor(source) {
    this.source = source;
    this.origin = 0;
  }

  reset(seconds = 0) {
    this.origin = this.source() - seconds;
  }

  seek(seconds) {
    this.reset(seconds);
  }

  now() {
    return Math.max(0, this.source() - this.origin);
  }
}
