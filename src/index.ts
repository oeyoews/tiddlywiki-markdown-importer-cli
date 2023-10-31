import fs from "fs";
import path from "path";
import chalk from "chalk";
import write from "@/write";
import dotenv from "dotenv";
import formattime from "@/formattime";
import readDirRecursive from "@/getallfiles";

dotenv.config();

const { PORT, IMPORTERPATH, HOST, USERNAME, TUSERNAME } = process.env;

const markdownImporterPath = IMPORTERPATH || "content";
const port = PORT || 8000;
const host = HOST || "http://localhost";

const url = `${host}:${port}`;

if (!fs.existsSync(markdownImporterPath)) {
  new Error(`${markdownImporterPath} 不存在`);
}

const files = readDirRecursive(markdownImporterPath);

const writefiles = new Map();

// 遍历文件列表
files.forEach((file) => {
  // 检查文件扩展名是否为.md，以过滤出Markdown文件
  const pattern = /[^\\/:*?"<>|\r\n]+(?=\.[^.\\]+$)/;
  const title = file.match(pattern)[0];
  // record files
  if (writefiles.has(title)) {
    console.log(chalk.red.bold(`title: ${title} 已存在`));
    return;
  } else {
    writefiles.set(title, file);
  }
  const extname = path.extname(file);
  if (extname !== ".md" && extname !== ".markdown") return;

  const text = fs.readFileSync(file, "utf-8");

  const { birthtime, mtime } = fs.statSync(file);
  const created = formattime(birthtime);
  const modified = formattime(mtime);
  const creator = TUSERNAME || USERNAME || "markdown-importer";

  // TODO: 测试是否可以自动递归目录
  const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, url);

  const tiddler = {
    title, // 可以省略, puttiddlerurl 决定这个
    text,
    type: "text/markdown",
    created,
    creator,
    modified,
  };

  fetch(putTiddlerUrl)
    .then((res) => {
      let data;
      if (res.ok) {
        data = res.json();
        return data;
      }
      return false;
    })
    .then((data) => {
      if (data) {
        console.log(chalk.red.bold(`Import of ${title} failed`));
        return;
      } else {
        write(putTiddlerUrl, tiddler);
      }
    });
});