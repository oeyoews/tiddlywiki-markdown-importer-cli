#!/usr/bin/env node

// @ts-nocheck
import fs from "fs";
import path from "path";
import chalk from "chalk";
import write from "./src/write";
import dotenv from "dotenv";
import formattime from "./src/formattime";
import readDirRecursive from "./src/getallfiles";
import matter from "gray-matter";
import filterNonStringValues from "./src/lib/filterfrontmatter";
import { program } from "commander";

dotenv.config();

const { PORT, IMPORTERPATH, HOST, USERNAME, TUSERNAME } = process.env;

program
  .option("-p, --port <port>", "设置端口号 <8000>")
  .option("-i, --importerpath <importpath>", "设置导入路径 <content>")
  .option("-H, --host <host>", "设置主机名: http://0.0.0.0")
  .option("-u, --username <username>", "设置用户名 <your pc username>")
  .parse();

const {
  port = PORT,
  importpath = IMPORTERPATH,
  host = HOST,
  username = TUSERNAME || USERNAME || "markdown-importer",
} = program.opts();

const url = `${host}:${port}`;

const targetdir = path.resolve(".", importpath);
console.log(targetdir);
if (!fs.existsSync(targetdir)) {
  new Error(`${targetdir} 不存在`);
}

const files = readDirRecursive(targetdir);

const writefiles = new Map();

// 遍历文件列表
files.forEach((file) => {
  // 检查文件扩展名是否为.md，以过滤出Markdown文件
  const pattern = /[^\\/:*?"<>|\r\n]+(?=\.[^.\\]+$)/;
  let title = file.match(pattern)[0];
  const extname = path.extname(file);
  if (extname !== ".md" && extname !== ".markdown") return;

  const text = fs.readFileSync(file, "utf-8");
  // TODO: content 首行不会被去除
  const { data, content } = matter(text);
  if (!data) return;
  let removednewlineContent = content;

  // if (content.startsWith("\n")) {
  //   removednewlineContent = content.replace(/^\n+/, "");
  // }

  if (data?.title) {
    title = data.title;
  }

  const filteredData = filterNonStringValues(data);

  // record files
  if (writefiles.has(title)) {
    console.log(chalk.red.bold(`title: ${title} 已存在`));
    return;
  } else {
    writefiles.set(title, file);
  }
  const { birthtime, mtime } = fs.statSync(file);
  const created = formattime(birthtime);
  const modified = formattime(mtime);

  // TODO: 测试是否可以自动递归目录
  const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, url);

  const tiddler = {
    text: content,
    type: "text/markdown",
    created,
    creator: username,
    modified,
  };

  Object.assign(tiddler, filteredData);

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
