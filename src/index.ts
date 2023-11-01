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
import { version } from '../package.json';

dotenv.config();

const { PORT, IMPORTPATH, HOST, USERNAME, TUSERNAME } = process.env;

program
  .option('-p, --port <port>', '设置端口号 <8080>')
  .option('-i, --importpath <importpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .version(version, '-v, --version', '显示版本')
  .parse();

// cli 中 dotenv 不可用
const {
  port = PORT || 8080,
  importpath = IMPORTPATH || 'content',
  host = HOST || 'http://0.0.0.0',
  username = TUSERNAME || USERNAME || 'markdown-importer',
} = program.opts();
const baseurl = `${host}:${port}`;

console.log(
  chalk.green(`\n==================\nport: ${port}
importpath: ${importpath}
url: ${baseurl}
username: ${username}\n=====================\n`),
);

const targetdir = path.resolve('.', importpath);
const files = readDirRecursive(targetdir);

const progressBar = new cliProgress.SingleBar(
  {
    format: `${chalk.green('{bar}')} {percentage}% | {value}/{total} {title} `,
    stopOnComplete: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  cliProgress.Presets.shades_classic,
);

const writefiles = new Map();

const main = async () => {
  const response = await fetch(baseurl);
  // TODO
  if (!response.ok) {
    throw new Error(`Failed to fetch ${baseurl}. Status: ${response.status}`);
  }

  const markdownFiles = files.filter(
    ({ filetype }) => filetype === '.md' || filetype === '.markdown',
  );

  markdownFiles.forEach(({ filename: title, filePath }, index) => {
    const { birthtime, mtime } = fs.statSync(filePath);
    const created = formattime(birthtime);
    const modified = formattime(mtime);
    const text = fs.readFileSync(filePath, 'utf-8');
    // TODO: content 首行不会被去除
    const { data, content } = matter(text);

    if (data?.title) {
      title = data.title;
    }
    progressBar.start(markdownFiles.length, index, { title });

    const filteredData = filterNonStringValues(data);

    // record files
    if (writefiles.has(title)) {
      console.log(chalk.red.bold(`title: ${title} 已存在`));
      return;
    } else {
      writefiles.set(title, filePath);
    }

    const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, baseurl);

    const tiddler = {
      text: content,
      type: 'text/markdown',
      created,
      creator: username,
      modified,
    };

    // TODO
    try {
      Object.assign(tiddler, filteredData);
    } catch (e) {
      console.log(e);
    }

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
        }
        // @ts-ignore
        write(putTiddlerUrl, tiddler, title);
        progressBar.update(index + 1, { title });
      });
  });
};

main().then(() => {
  progressBar.stop();
});