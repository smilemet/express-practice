import logger from "./helper/LogHelper.js";
import { myip, urlFormat } from "./helper/UtilHelper.js";

import url from "url";
import path, { resolve } from "path";
import dotenv from "dotenv";
import express from "express";
import useragent from "express-useragent";
import serveStatic from "serve-static";
import serveFavicon from "serve-favicon";

/** express 객체 생성 */
const app = express();
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, "../config.env") });

/** 클라이언트 접속시 초기화 */
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

/** express 객체 추가 설정 */
app.use("/", serveStatic(process.env.PUBLIC_PATH));
app.use(serveFavicon(process.env.FAVICON_PATH));

const router = express.Router(); // 라우터 객체는 맨 마지막에 설정할 것!
app.use("/", router);

/** URL별 백엔드 기능 정의 */
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

// params 관련
router.get("/send_get", (req, res, next) => {
  logger.debug("[프론트엔드로부터 전달받은 GET 파라미터]");
  for (let key in req.query) {
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

/** 이상 내용을 기반으로 서버 구동 */
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
