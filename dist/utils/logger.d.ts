/**
 * Available log levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Global logger utility for colorful console logging
 */
export declare class Logger {
    /**
     * Current log level (configurable)
     */
    private static currentLevel;
    /**
     * Set the current log level
     * @param level The log level to set
     */
    static setLogLevel(level: LogLevel): void;
    /**
     * Log a debug message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static debug(context: string, message: string, data?: any): void;
    /**
     * Log an info message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static info(context: string, message: string, data?: any): void;
    /**
     * Log a warning message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static warn(context: string, message: string, data?: any): void;
    /**
     * Log an error message
     * @param context The context or component name
     * @param message The message to log
     * @param error Optional error to include
     */
    static error(context: string, message: string, error?: any): void;
    /**
     * Log a success message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static success(context: string, message: string, data?: any): void;
    /**
     * Log HTTP requests
     * @param method HTTP method
     * @param url Request URL
     * @param statusCode HTTP status code
     * @param duration Request duration in ms
     */
    static http(method: string, url: string, statusCode?: number, duration?: number): void;
}
