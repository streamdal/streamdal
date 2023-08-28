class Logger {
  constructor(packageName) {
    this.colors = {
      reset: "\x1B[0m",
      fg: {
        red: "\x1B[31m",
        green: "\x1B[32m",
        yellow: "\x1B[33m"
      }
    };
    this.packageName = packageName;
  }
  log(msg, prefix = "") {
    console.log(`%s${this.packageName}:%s ${msg}
`, prefix, prefix ? this.colors.reset : "");
  }
  info(msg) {
    this.log(msg);
  }
  success(msg) {
    this.log(msg, this.colors.fg.green);
  }
  warn(msg) {
    this.log(`Skipped!
${msg}`, this.colors.fg.yellow);
  }
  error(msg) {
    this.log(`Failed!
${msg}`, this.colors.fg.red);
  }
}
export {
  Logger
};
