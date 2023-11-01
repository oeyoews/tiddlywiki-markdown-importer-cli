#!/usr/bin/env node

import path from 'path';
import readDirRecursive from './getallfiles';
import { program } from 'commander';
import { version } from '../package.json';
import { log } from './lib/log';
import { importfile } from './core/importfile';
import { progressBar } from './lib/progressbar';

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Put%20Tiddler
program
  .option('-p, --port <port>', '设置端口号 <8080>')
  .option('-i, --importpath <importpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .version(version, '-v, --version', '显示版本')
  .parse();

// cli 中 dotenv 不可用
const {
  port = 8080,
  importpath = 'content',
  host = 'http://0.0.0.0',
  username = process.env.USERNAME || 'markdown-importer',
} = program.opts();

const markdowntypes = ['.md', '.markdown'];

const baseurl = `${host}:${port}`;

log(
  `\n==================\nport: ${port}
importpath: ${importpath}
baseurl: ${baseurl}
username: ${username}\n=====================\n`,
);

const targetdir = path.resolve('.', importpath);
const files = readDirRecursive(targetdir);
const markdownFiles = files.filter(({ filetype }) =>
  markdowntypes.includes(filetype),
);

progressBar.start(markdownFiles.length, 0, { title: '', type: '' });

const writefiles = new Map();

fetch(baseurl)
  .then(() => {
    markdownFiles.forEach(({ filename: title, filePath }, index) => {
      progressBar.update(index, { title, type: 'Importing:' });
      importfile(
        title,
        filePath,
        index,
        writefiles,
        baseurl,
        username,
        progressBar,
      );
      progressBar.update(index + 1, { title });
    });
  })
  .then(() => progressBar.stop());
