#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import write from './write';
import dotenv from 'dotenv';
import formattime from './formattime';
import readDirRecursive from './getallfiles';
import matter from 'gray-matter';
import filterNonStringValues from './lib/filterfrontmatter';
import { program } from 'commander';
import cliProgress from 'cli-progress';

dotenv.config();

const { PORT, IMPORTPATH, HOST, USERNAME, TUSERNAME } = process.env;

program
  .option('-p, --port <port>', '设置端口号 <8000>')
  .option('-i, --importpath <importpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .parse();

// cli 中 dotenv 不可用
const {
  port = PORT || 8000,
  importpath = IMPORTPATH || 'content',
  host = HOST || 'http://0.0.0.0',
  username = TUSERNAME || USERNAME || 'markdown-importer',
} = program.opts();

const url = `${host}:${port}`;

const targetdir = path.resolve('.', importpath);
const files = readDirRecursive(targetdir);

const progressBar = new cliProgress.SingleBar(
  {
    format: `${chalk.green('{bar}')} {percentage}% | {value}/{total} {title}`,
    stopOnComplete: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  cliProgress.Presets.shades_classic,
);

const writefiles = new Map();

// 遍历文件列表
files.forEach((file, index) => {
  // cli-progress
  // 检查文件扩展名是否为.md，以过滤出Markdown文件
  const pattern = /[^\\/:*?"<>|\r\n]+(?=\.[^.\\]+$)/;
  let title = file.match(pattern)[0];
  const extname = path.extname(file);
  if (extname !== '.md' && extname !== '.markdown') return;

  const text = fs.readFileSync(file, 'utf-8');
  // TODO: content 首行不会被去除
  const { data, content } = matter(text);
  if (!data) return;
  let removednewlineContent = content;

  if (data?.title) {
    title = data.title;
  }

  progressBar.start(files.length, index, { title });

  const filteredData = filterNonStringValues(data);

  // record files
  if (writefiles.has(title)) {
    // console.log(chalk.red.bold(`title: ${title} 已存在`));
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
    type: 'text/markdown',
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
        // console.log(chalk.red.bold(`Import of ${title} failed`));
        return;
      } else {
        // @ts-ignore
        write(putTiddlerUrl, tiddler, title);
      }
    })
    .then(() => {
      progressBar.update(index + 1, { title });
      if (index === files.length) {
        progressBar.stop();
      }
    });
});
