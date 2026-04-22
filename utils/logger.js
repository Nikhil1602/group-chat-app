const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: "error", // only log errors (can change to 'info' later)
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: "logs/error.log" })
    ]
});

module.exports = logger;