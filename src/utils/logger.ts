import chalk from 'chalk';

/**
 * Available log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Global logger utility for colorful console logging
 */
export class Logger {
  /**
   * Current log level (configurable)
   */
  private static currentLevel: LogLevel = process.env.NODE_ENV === 'production' 
    ? LogLevel.INFO 
    : LogLevel.DEBUG;

  /**
   * Set the current log level
   * @param level The log level to set
   */
  static setLogLevel(level: LogLevel): void {
    Logger.currentLevel = level;
  }

  /**
   * Log a debug message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static debug(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.blue.bold('[DEBUG]')} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ''
      );
    }
  }

  /**
   * Log an info message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static info(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.green.bold('[INFO]')} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ''
      );
    }
  }
  
  /**
   * Log a warning message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static warn(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.WARN) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.yellow.bold('[WARN]')} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ''
      );
    }
  }
  
  /**
   * Log an error message
   * @param context The context or component name
   * @param message The message to log
   * @param error Optional error to include
   */
  static error(context: string, message: string, error?: any): void {
    if (Logger.currentLevel <= LogLevel.ERROR) {
      console.error(
        `${chalk.gray(new Date().toISOString())} ${chalk.red.bold('[ERROR]')} ${chalk.cyan(`[${context}]`)} ${message}`,
        error ? `\n${chalk.red(error.stack || JSON.stringify(error))}` : ''
      );
    }
  }

  /**
   * Log a success message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static success(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.greenBright.bold('[SUCCESS]')} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ''
      );
    }
  }

  /**
   * Log HTTP requests
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode HTTP status code
   * @param duration Request duration in ms
   */
  static http(method: string, url: string, statusCode?: number, duration?: number): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      let message = `${method} ${url}`;
      
      if (statusCode) {
        const coloredStatus = statusCode >= 500
          ? chalk.red(statusCode)
          : statusCode >= 400
            ? chalk.yellow(statusCode)
            : statusCode >= 300
              ? chalk.cyan(statusCode)
              : chalk.green(statusCode);
        
        message += ` ${coloredStatus}`;
      }
      
      if (duration !== undefined) {
        const coloredDuration = duration > 1000
          ? chalk.red(`${duration}ms`)
          : duration > 500
            ? chalk.yellow(`${duration}ms`)
            : chalk.green(`${duration}ms`);
        
        message += ` ${coloredDuration}`;
      }
      
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.magenta.bold('[HTTP]')} ${message}`
      );
    }
  }
}
