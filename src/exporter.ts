import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { log } from './lib/log';
import slugify from 'slugify';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

const baseurl = 'http://0.0.0.0:8000';
const markdowntype = ['text/markdown', 'text/x-markdown'];
const exportPath = 'content';
const fileExtension = '.md'; // .mdx

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

const tiddlersjson = new URL(`recipes/default/tiddlers.json`, baseurl);

const markdownfiletitles: string[] = [];
const user = 'oeyoews';
const password = 'oeyoews';

const headers = new Headers();

// TODO: 验证是否需要密码
// TODO: 是否验证成功
// headers.append('Authorization', 'Basic ' + btoa(user + ':' + password));

// https://bramchen.github.io/tw5-docs/zh-Hans/#ListenCommand
// https://github.com/Jermolene/TiddlyWiki5/pull/7471
fetch(tiddlersjson, {
  // @ts-ignore
  // data: {
  //   user,
  //   password,
  //   tiddlyweb_redirect: '/status',
  // },
  method: 'GET',
  headers: {
    'X-Authenticated-User': 'oeyoews',
  },
})
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
      getfile(title);
      progressBar.update(index + 1, { title });
    });
  })
  .then(() => {
    progressBar.stop();
    log(`\n共有 ${markdownfiletitles.length} 个 tiddler`, 'cyan');
  });

function getfile(title: string) {
  const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, baseurl);
  fetch(putTiddlerUrl)
    .then((res) => {
      if (res.ok) return res.json();
      return false;
    })
    .then((data) => {
      if (!data) {
        log(`获取 ${title} 失败`, 'red');
        return;
      }

      const { text, fiedls, ...restfields } = data;

      if (!markdowntype.includes(restfields?.type)) {
        log(`${title} 不是 markdown 类型`, 'red');
        return;
      }

      // 导出的字段使用原生格式, 不做任何修改, 尽量让第三方框架适配这个格式, 而不是在这里修改
      const frontmatter = Object.assign({}, restfields, fiedls);

      const content = matter.stringify({ content: `\n${text}` }, frontmatter);

      const fileName = `${slugify(title, {
        lower: true,
        remove: /[*+~./()'"!:@]/g,
      })}${fileExtension}`;
      const targetfilename = path.join(exportPath, fileName);

      if (!fs.existsSync(targetfilename)) {
        fs.writeFileSync(targetfilename, content);
      } else {
        log(`${title} 已存在`, 'red');
      }
    });
}