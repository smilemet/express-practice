/**
 * @Description : 서버 로그를 기록
 */
import dotenv from "dotenv";
import winston from "winston";
import winstionDaily from "winston-daily-rotate-file";
import { join, resolve } from "path";
import mkdirs from "./FileHelper.js";

// 보안을 위해 하나 위의 단계에 .env 파일 형성
dotenv.config({ path: join(resolve(), "../config.env") });
mkdirs(process.env.LOG_PATH);

const { combine, timestamp, printf, splat, simple } = winston.format;

const logger = winston.createLogger({
  // 로그의 전반적인 형식
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss SSS",
    }),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}] : ${message}`;
    }),
    splat()
  ),

  // 일반 로그 규칙 정의
  transports: [
    new winstionDaily({
      name: "log",
      level: process.env.LOG_LEVEL,
      datePattern: "YYMMDD",
      dirname: process.env.LOG_PATH,
      filename: "log_%DATE%.log",
      maxSize: 50000000,
      maxFiles: 50,
      zippedArchive: true,
    }),
  ],
});

// 상용화 버전이 아닐 경우
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      prettyPrint: true,
      showLevel: true,
      level: process.env.LOG_LEVEL,
      format: combine(
        winston.format.colorize(),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}] : ${message}`;
        })
      ),
    })
  );
}

export default logger;
