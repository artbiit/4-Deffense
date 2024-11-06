import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, "../../assets");

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

let gameAssets = {};

export const loadGameAssets = async () => {
  const [bases, monsters, towers] = await Promise.all([
    readFileAsync("base.json"),
    readFileAsync("monster.json"),
    readFileAsync("tower.json"),
  ]);

  gameAssets = { bases, monsters, towers };
  logger.info(`GameAsset Initialized : ${Object.keys(gameAssets).length}`);
  return gameAssets;
};

export const getGameAssets = () => {
  return gameAssets;
};
