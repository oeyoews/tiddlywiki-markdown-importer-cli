#!/usr/bin/env node

import { program } from 'commander';
import { version } from '../package.json';
import { log } from './lib/log';

import importer from './importer';
import exporter from './exporter';

let actiontype: any = null;

program
  .command('import')
  .description('md -> tw')
  .action(() => {
    actiontype = 'import';
  });

program
  .command('export')
  .description('tw -> md')
  .action(() => {
    actiontype = 'export';
  });

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Put%20Tiddler
program
  .option('-p, --port <port>', '设置端口号 <8080>')
  .option('-i, --twpath <twpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .version(version, '-v, --version', '显示版本')
  .parse(); // last parse before command

const {
  port = 8080,
  twpath = 'content',
  host = 'http://0.0.0.0',
  username = process.env.USERNAME || 'markdown-importer',
} = program.opts();

log(
  `\n==================\nport: ${port}
twpath: ${twpath}
host: ${host}
username: ${username}\n=====================\n`,
);

const actions: any = {
  import: importer,
  export: exporter,
};

actions[actiontype]({ host, port, twpath, username });
