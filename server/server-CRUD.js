import logger from "./helper/LogHelper.js";
import { myip, urlFormat } from "./helper/UtilHelper.js";

import url from "url";
import path, { resolve } from "path";
import dotenv from "dotenv";
import express from "express";
import useragent from "express-useragent";
import serveStatic from "serve-static";
import serveFavicon from "serve-favicon";
import methodOverride from "method-override";
import { loggers } from "winston";

/* --------------------------------
 * express 객체 생성 
 -------------------------------- */
const app = express();
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, "../config.env") });

/* --------------------------------
 * 클라이언트 접속시 초기화 
 --------------------------------*/
app.use(useragent.express());
app.use((req, res, next) => {
  logger.debug("클라이언트가 접속했습니다.");

  const beginTime = Date.now();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  logger.debug(
    `[client] ${ip} / ${req.useragent.os} / ${req.useragent.browser} (${req.useragent.version}) / ${req.useragent.platform}`
  );

  const current_url = urlFormat({
    protocol: req.protocol, // http://
    host: req.get("host"), // 172.16.141.1~
    port: req.port, // 8080
    pathname: req.originalUrl, // /index.html
  });

  logger.debug(`[${req.method}] ${decodeURIComponent(current_url)}`);

  res.on("finish", () => {
    const endTime = Date.now();
    const time = endTime - beginTime;
    logger.debug(`클라이언트의 접속이 종료되었습니다. ::: [runtime] ${time}ms`);
    logger.debug(`---------------------------------------------------`);
  });

  next();
});

/* --------------------------------
 * express 객체 추가 - 미들웨어 
 --------------------------------*/
app.use(express.urlencoded({ extended: true })); // post 파라미터 수신 미들웨어 → 미들웨어 중 가장 먼저 설정할 것!
app.use(express.text());
app.use(express.json());

app.use(methodOverride("X-HTTP-Method")); // Microsoft ::: PUT, DELETE 전송방식 확장 -> HTTP HEADER 이름 지정
app.use(methodOverride("X-HTTP-Method-override")); // Google, GData
app.use(methodOverride("X-Method-Override")); // IBM
app.use(methodOverride("_method")); // HTML form

app.use("/", serveStatic(process.env.PUBLIC_PATH));
app.use(serveFavicon(process.env.FAVICON_PATH));

const router = express.Router(); // 라우터 객체는 맨 마지막에 설정할 것!
app.use("/", router);

/* --------------------------------
 * URL별 백엔드 기능 정의 
 --------------------------------*/
router.get("/page1", (req, res, next) => {
  let html = "<h1>Hello World!</h1>";
  html += "<h2>테스트 페이지</h2>";

  res.status(200).send(html);
});

router.get("/page2", (req, res, next) => {
  let html = "<h1>Hello Javascript!</h1>";
  html += "<h2>테스트 페이지222</h2>";

  res.status(200).send(html);
});

router.get("/page3", (req, res, next) => {
  res.redirect("https://www.naver.com");
});

// params
router.get("/send_get", (req, res, next) => {
  logger.debug("[프론트엔드로부터 전달받은 GET 파라미터]");
  for (const key in req.query) {
    const str = `\t >> ${key} = ${req.query[key]}`;
    logger.debug(str);
  }

  console.log(req.query);

  const answer = req.query.answer;
  let html = null;

  if (parseInt(answer) === 300) {
    html = "<p>정답입니다!</p>";
  } else {
    html = "<p>틀렸습니다!</p>";
  }

  res.status(200).send(html);
});

// CRUD
router.post("/send_post", (req, res, next) => {
  logger.debug("[프론트엔드로부터 전달받은 POST 파라미터]");
  for (const key in req.body) {
    const str = `\t >> ${key} = ${req.body[key]}`;
    logger.debug(str);
  }
});

/* --------------------------------
 * 이상 내용을 기반으로 서버 구동 
 --------------------------------*/
const ip = myip();
app.listen(process.env.PORT, () => {
  logger.debug("------------------------------------");
  logger.debug("|       Start Express Server       |");
  logger.debug("------------------------------------");

  ip.forEach((v, i) => {
    logger.debug(`server address => http://${v}:${process.env.PORT}`);
  });

  logger.debug("------------------------------------");
});
