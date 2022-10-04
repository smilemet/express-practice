/**
 * @Description : 파일, 폴더 처리 유틸리티 함수
 * 경로를 순차적으로 타고 들어가면서 중간 디렉토리를 모두 생성한다.
 */
import fs from "fs";
import { join } from "path";

const mkdirs = (target, permission = "0755") => {
  if (target === undefined || target === null) return;

  // 윈도우 디렉토리 '\' → '/'로 변경
  target = target.replace(/\\/gi, "/");
  const target_list = target.split("/");
  let dir = "";

  // 절대경로인 경우
  if (target.substring(0, 1) === "/") dir = "/";

  // 하드디스크 문자열로 시작하는 경우
  if (target_list[0].indexOf(":") > -1) target_list[0] += "/";

  target_list.map((v, i) => {
    dir = join(dir, v);

    if (v === ".") return;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      fs.chmodSync(dir, permission);
    }
  });
};

export default mkdirs;
