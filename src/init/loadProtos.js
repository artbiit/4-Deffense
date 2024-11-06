import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";
import logger from "../utils/logger.js";

// 현재 파일의 절대 경로 추출
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로토파일이 있는 디렉토리 경로 설정
const protoDir = path.join(__dirname, "../protobuf");

// 주어진 디렉토리 내 모든 proto 파일을 재귀적으로 찾는 함수
const getAllProtoFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFiles(filePath, fileList);
    } else if (path.extname(file) === ".proto") {
      fileList.push(filePath);
    }
  });
  return fileList;
};

// 로드된 프로토 메시지들을 저장할 객체
const protoMessages = {};

// 모든 .proto 파일을 로드하여 프로토 메시지를 초기화합니다.
export const loadProtos = async () => {
  try {
    // 모든 proto 파일 경로를 가져옴
    const protoFiles = getAllProtoFiles(protoDir);

    const root = new protobuf.Root();

    await Promise.all(protoFiles.map((file) => root.load(file)));

    root.resolveAll();

    // 각 파일의 메시지를 기반으로 protoMessages 객체 구성
    const loadedRoot = root.nested;

    let loadedCount = 0;
    if (loadedRoot) {
      Object.entries(loadedRoot).forEach(([namespaceName, namespace]) => {
        if (namespace instanceof protobuf.Type) {
          // 패키지가 없는 경우 메시지를 직접 불러옵니다.
          protoMessages[namespaceName] = root.lookupType(namespaceName);
          loadedCount++;
        } else if (namespace.nested) {
          // 패키지가 있는 경우 기존 방식으로 메시지를 불러옵니다.
          Object.entries(namespace.nested).forEach(([typeName, type]) => {
            if (type instanceof protobuf.Type) {
              const fullName = `${namespaceName}.${typeName}`;
              if (!protoMessages[namespaceName]) {
                protoMessages[namespaceName] = {};
              }
              protoMessages[namespaceName][typeName] =
                root.lookupType(fullName);
              loadedCount++;
            }
          });
        }
      });
    }

    logger.info(`Protobuf initialized : ${loadedCount}`);
  } catch (error) {
    logger.error("Protobuf 파일 로드 중 오류가 발생했습니다:", error);
  }
};

// 로드된 프로토 메시지들의 얕은 복사본을 반환합니다.
export const getProtoMessages = () => {
  return { ...protoMessages };
};
