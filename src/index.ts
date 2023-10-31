import fs from "fs";
import path from "path";
import chalk from "chalk";
import write from "@/write";
import dotenv from "dotenv";
import formattime from "./formattime";

dotenv.config();

const { PORT, IMPORTERPATH, HOST, USERNAME, TUSERNAME } = process.env;

const markdownImporterPath = IMPORTERPATH || "content";
const port = PORT || 8000;
const host = HOST || "http://localhost";

const url = `${host}:${port}`;

const files = fs.readdirSync(IMPORTERPATH);


// test
const title = "index";
const filename = `${markdownImporterPath}/${title}.md`;
const text = fs.readFileSync(filename, "utf-8");

if (!fs.existsSync(markdownImporterPath)) {
  console.log(`${markdownImporterPath} 不存在`);
}

// TODO: try catch
const { birthtime, mtime } = fs.statSync(filename);

const created = formattime(birthtime);
const modified = formattime(mtime);
const creator = TUSERNAME || USERNAME || "markdown-importer"; // 这一步会关系到用户隐私

const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, url);

const tiddler = {
  title,
  text,
  type: "text/markdown", // TODO: image/png image/jpg 特殊处理
  created,
  creator,
  modified,
  // tags: "", // TODO
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
      console.log(data);
      const { title, text, type, created, creator, modified, tags } = data;
      console.log(chalk.red.bold("import failed"));
      return;
    } else {
      write(putTiddlerUrl, tiddler);
    }
  });

// generate import tiddlers
