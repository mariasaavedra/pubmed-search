"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Available log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Global logger utility for colorful console logging
 */
class Logger {
    /**
     * Set the current log level
     * @param level The log level to set
     */
    static setLogLevel(level) {
        Logger.currentLevel = level;
    }
    /**
     * Log a debug message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static debug(context, message, data) {
        if (Logger.currentLevel <= LogLevel.DEBUG) {
            console.log(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.blue.bold('[DEBUG]')} ${chalk_1.default.cyan(`[${context}]`)} ${message}`, data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : '');
        }
    }
    /**
     * Log an info message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static info(context, message, data) {
        if (Logger.currentLevel <= LogLevel.INFO) {
            console.log(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.green.bold('[INFO]')} ${chalk_1.default.cyan(`[${context}]`)} ${message}`, data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : '');
        }
    }
    /**
     * Log a warning message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static warn(context, message, data) {
        if (Logger.currentLevel <= LogLevel.WARN) {
            console.log(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.yellow.bold('[WARN]')} ${chalk_1.default.cyan(`[${context}]`)} ${message}`, data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : '');
        }
    }
    /**
     * Log an error message
     * @param context The context or component name
     * @param message The message to log
     * @param error Optional error to include
     */
    static error(context, message, error) {
        if (Logger.currentLevel <= LogLevel.ERROR) {
            console.error(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.red.bold('[ERROR]')} ${chalk_1.default.cyan(`[${context}]`)} ${message}`, error ? `\n${chalk_1.default.red(error.stack || JSON.stringify(error))}` : '');
        }
    }
    /**
     * Log a success message
     * @param context The context or component name
     * @param message The message to log
     * @param data Optional data to include
     */
    static success(context, message, data) {
        if (Logger.currentLevel <= LogLevel.INFO) {
            console.log(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.greenBright.bold('[SUCCESS]')} ${chalk_1.default.cyan(`[${context}]`)} ${message}`, data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : '');
        }
    }
    /**
     * Log HTTP requests
     * @param method HTTP method
     * @param url Request URL
     * @param statusCode HTTP status code
     * @param duration Request duration in ms
     */
    static http(method, url, statusCode, duration) {
        if (Logger.currentLevel <= LogLevel.INFO) {
            let message = `${method} ${url}`;
            if (statusCode) {
                const coloredStatus = statusCode >= 500
                    ? chalk_1.default.red(statusCode)
                    : statusCode >= 400
                        ? chalk_1.default.yellow(statusCode)
                        : statusCode >= 300
                            ? chalk_1.default.cyan(statusCode)
                            : chalk_1.default.green(statusCode);
                message += ` ${coloredStatus}`;
            }
            if (duration !== undefined) {
                const coloredDuration = duration > 1000
                    ? chalk_1.default.red(`${duration}ms`)
                    : duration > 500
                        ? chalk_1.default.yellow(`${duration}ms`)
                        : chalk_1.default.green(`${duration}ms`);
                message += ` ${coloredDuration}`;
            }
            console.log(`${chalk_1.default.gray(new Date().toISOString())} ${chalk_1.default.magenta.bold('[HTTP]')} ${message}`);
        }
    }
}
exports.Logger = Logger;
/**
 * Current log level (configurable)
 */
Logger.currentLevel = process.env.NODE_ENV === 'production'
    ? LogLevel.INFO
    : LogLevel.DEBUG;
//# sourceMappingURL=logger.js.map