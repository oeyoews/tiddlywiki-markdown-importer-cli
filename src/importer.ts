#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readDirRecursive from './lib/getallfiles';
import { program } from 'commander';
import { version } from '../package.json';
import { log } from './lib/log';
import { importFile } from './core/importfile';
import { progressBar } from './lib/progressbar';

// index -> importfiles -> importer
// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Put%20Tiddler
program
  .option('-p, --port <port>', '设置端口号 <8080>')
  .option('-i, --twpath <twpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .version(version, '-v, --version', '显示版本')
  .parse();

// cli 中 dotenv 不可用
const {
  port = 8080,
  twpath = 'content',
  host = 'http://0.0.0.0',
  username = process.env.USERNAME || 'markdown-importer',
} = program.opts();

const markdowntypes = ['.md', '.markdown'];
const baseurl = `${host}:${port}`;

log(
  `\n==================\nport: ${port}
twpath: ${twpath}
baseurl: ${baseurl}
username: ${username}\n=====================\n`,
);

const targetdir = path.resolve('.', twpath);
const files = readDirRecursive(targetdir);
const markdownFiles = files.filter(({ filetype }) =>
  markdowntypes.includes(filetype),
);

if (!fs.existsSync(twpath)) {
  log(`文件夹 ${twpath} 不存在`, 'red');
  throw new Error('文件夹不存在');
}

progressBar.start(markdownFiles.length, 0, { title: '', type: '' });

markdownFiles.forEach(({ filename: title, filePath }, index) => {
  progressBar.update(index, { title, type: 'Importing:' });
  importFile(baseurl, filePath, title, username);
  progressBar.update(index + 1, { title });
});


