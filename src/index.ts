#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import readDirRecursive from './getallfiles';
import { program } from 'commander';
import cliProgress from 'cli-progress';
import { version } from '../package.json';
import { log } from './lib/log';
import { importfile } from './core/importfile';

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
const url = `${host}:${port}`;

log(
  `\n==================\nport: ${port}
importpath: ${importpath}
url: ${url}
username: ${username}\n=====================\n`,
);

const targetdir = path.resolve('.', importpath);
const files = readDirRecursive(targetdir);
const markdownFiles = files.filter(
  ({ filetype }) => filetype === '.md' || filetype === '.markdown',
);

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Put%20Tiddler
const progressBar = new cliProgress.SingleBar(
  {
    format: `${chalk.green(
      'Importing: {bar}',
    )} {percentage}% | {value}/{total} {title} `,
    stopOnComplete: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  cliProgress.Presets.shades_classic,
);
progressBar.start(markdownFiles.length, 0, { title: '' });

const writefiles = new Map();

fetch(url)
  .then((res) => {
    // TODO: 验证
    if (!res.ok) {
      throw new Error('error');
    }
  })
  .then(() => {
    markdownFiles.forEach(({ filename: title, filePath }, index) => {
      progressBar.update(index, { title });
      importfile(
        title,
        filePath,
        index,
        writefiles,
        url,
        username,
        progressBar,
      );
      progressBar.update(index + 1, { title });
    });
  })
  .then(() => progressBar.stop());
