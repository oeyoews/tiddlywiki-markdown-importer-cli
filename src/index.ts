import fs from "fs";
import path from "path";
import chalk from "chalk";
import write from "@/write";
import dotenv from "dotenv";
import formattime from "./formattime";

dotenv.config();

// 针对本地太微nodejs(无密码)实例
// 写入, 导出, 更新, 查询, 删
// TODO: 需要做好条目重写的提示
// https://github.com/Jermolene/TiddlyWiki5/blob/4b56cb42983d4134715eb7fe7b083fdcc04980f0/core/modules/server/server.js#L31
// https://github.com/Jermolene/TiddlyWiki5/blob/4b56cb42983d4134715eb7fe7b083fdcc04980f0/core/modules/server/routes/put-tiddler.js

const { PORT, IMPORTERPATH, HOST } = process.env;

const markdownImporterPath = IMPORTERPATH || "content";
const port = PORT || 8000;
const host = HOST || "http://localhost";

const url = `${host}:${port}`;

// test
const title = "index";
const text = title;

if (!fs.existsSync(markdownImporterPath)) {
  console.log(`${markdownImporterPath} 不存在`);
}

// TODO: try catch
const { birthtime, mtime } = fs.statSync(`${markdownImporterPath}/${title}.md`);

// @ts-ignore
const created = formattime(birthtime);
const modified = formattime(mtime);

const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, url);

const tiddler = {
  title,
  text,
  type: "text/markdown",
  created,
  // creator,
  modified,
  tags: "",
};

fetch(putTiddlerUrl)
  .then((res) => {
    if (res.ok) {
      const data = res.json();
      return data;
    }
    return false;
  })
  .then((data) => {
    if (data) {
      const { title, text, type, created, creator, modified, tags } = data;
      console.log(chalk.red.bold("import failed"));
      return;
    } else {
      write(putTiddlerUrl, tiddler);
    }
  });

// generate import tiddlers
