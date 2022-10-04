/**
 * @Description : 백엔드 개발 시 자주 활용하는 독립함수 모음
 */
import { networkInterfaces } from "os";

// 외부에서 접속 가능한 ip 주소 반환
const myip = () => {
  const ipAddress = [];
  const nets = networkInterfaces();

  for (const attr in nets) {
    const item = nets[attr];

    item.map((v, i) => {
      if (v.family === 4 && v.address !== "127.0.0.1") {
        ipAddress.push(v.address);
      }
    });
  }

  return ipAddress;
};

// url 객체 속성값 반환
const urlFormat = (urlObject) => String(Object.assign(new URL("http://a.com"), urlObject));

export { myip, urlFormat };
