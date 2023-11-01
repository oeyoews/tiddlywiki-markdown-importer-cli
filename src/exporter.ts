import fs from 'fs';
import { log } from './lib/log';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { getfile } from './core/exportfile';

const host = 'http://0.0.0.0';
const port = 8000;
const baseurl = `${host}:${port}`;
const markdowntype = ['text/markdown', 'text/x-markdown'];
const exportPath = 'content';
const fileExtension = '.md'; // .mdx

// 如果你构建了在线的tiddlers.json, 也可以直接使用那个地址, 可以使用tiddlyhost 测试, 默认提供tiddlers.json
// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20All%20Tiddlers
const progressBar = new cliProgress.SingleBar(
  {
    format: `${chalk.cyanBright.bold(
      'Export: {bar}',
    )} {percentage}% | {value}/{total} {title} `,
    stopOnComplete: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  cliProgress.Presets.shades_classic,
);

if (fs.existsSync(exportPath)) {
  fs.rmSync(exportPath, { recursive: true, force: true });
}
fs.mkdirSync(exportPath);

const tiddlersjsonurl = new URL(`/recipes/default/tiddlers.json`, baseurl);

const markdownfiletitles: string[] = [];

// TODO: 验证是否需要密码
// TODO: 是否验证成功
// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20Server%20Status
// headers.append('Authorization', 'Basic ' + btoa(user + ':' + password));

// https://bramchen.github.io/tw5-docs/zh-Hans/#ListenCommand
// https://github.com/Jermolene/TiddlyWiki5/pull/7471
// https://talk.tiddlywiki.org/t/question-how-to-render-json-instead-of-html-and-save-the-results-to-a-json-file/4910/15

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
      progressBar.start(markdownfiletitles.length, index, { title });
      getfile(title, markdowntype, baseurl, fileExtension, exportPath);
      progressBar.update(index + 1, { title });
    });
  })
  .then(() => {
    progressBar.stop();
    log(`\n共有 ${markdownfiletitles.length} 个 tiddler`, 'cyan');
  });
