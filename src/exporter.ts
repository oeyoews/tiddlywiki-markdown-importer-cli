import fs from 'fs';
import { log } from './lib/log';
import { exportFile } from './core/exportfile';
import { progressBar } from './lib/progressbar';
import { program } from 'commander';
import { version } from '../package.json';

program
  .option('-p, --port <port>', '设置端口号 <8080>')
  .option('-i, --twpath <twpath>', '设置导入路径 <content>')
  .option('-H, --host <host>', '设置主机名: http://0.0.0.0')
  .option('-u, --username <username>', '设置用户名 <your pc username>')
  .version(version, '-v, --version', '显示版本')
  .parse();

// exporter -> exporterfile
const {
  port = 8080,
  twpath = 'content',
  host = 'http://0.0.0.0',
  username = process.env.USERNAME || 'markdown-importer-exporter-cli',
} = program.opts();

const baseurl = `${host}:${port}`;
const markdowntype = ['text/markdown', 'text/x-markdown'];

log(
  `\n==================\nport: ${port}
twpath: ${twpath}
baseurl: ${baseurl}
username: ${username}\n=====================\n`,
);

// 如果你构建了在线的tiddlers.json, 也可以直接使用那个地址, 可以使用tiddlyhost 测试, 默认提供tiddlers.json
// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20All%20Tiddlers

if (fs.existsSync(twpath)) {
  fs.rmSync(twpath, { recursive: true, force: true });
}
fs.mkdirSync(twpath);

const tiddlersjsonurl = new URL(`/recipes/default/tiddlers.json`, baseurl);

const markdownfiletitles: string[] = [];

fetch(tiddlersjsonurl)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    if (!data) return;

    // @ts-ignore
    data.forEach(({ title, type }) => {
      markdowntype.includes(type) && markdownfiletitles.push(title);
    });
  })
  // 这里的异步其实无效
  .then(() => {
    markdownfiletitles.forEach((title, index) => {
      progressBar.start(markdownfiletitles.length, index, {
        title,
        type: '',
      });
      exportFile(baseurl, twpath, title, markdowntype);
      progressBar.update(index + 1, { title, type: 'Exporting:' });
    });
  })
  .then(() => {
    progressBar.stop();
    log(`\n共有 ${markdownfiletitles.length} 个 tiddler`, 'cyan');
  });
