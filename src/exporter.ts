import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { log } from './lib/log';
import slugify from 'slugify';

const baseurl = 'http://0.0.0.0:8000';
const markdowntype = ['text/markdown', 'text/x-markdown'];
const exportPath = 'backup';

// TODO: 异常处理
const tiddlersjson = new URL(`recipes/default/tiddlers.json`, baseurl);

const markdownfiletitles: string[] = [];

fetch(tiddlersjson)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    if (!data) return;
    log(`共有 ${data.length} 个 tiddler`);
    // @ts-ignore
    data.forEach(({ title, type }) => {
      markdowntype.includes(type) && markdownfiletitles.push(title);
    });
  })
  .then(() => {
    markdownfiletitles.forEach((title) => {
      getfile(title);
    });
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
      const { text, fields, ...frontmatter } = data;

      if (!markdowntype.includes(frontmatter?.type)) {
        log(`${title} 不是 markdown 类型`, 'red');
        return;
      }

      // TODO: 过滤空的属性
      const mergedfrontmatter = Object.assign({}, frontmatter, fields);
      const content = matter.stringify(
        { content: `\n${text}` },
        mergedfrontmatter,
      );

      const fileName = `${slugify(title, {
        lower: true,
        remove: /[*+~./()'"!:@]/g,
      })}.md`;
      const targetfilename = path.join(exportPath, fileName);

      if (!fs.existsSync(targetfilename)) {
        fs.writeFileSync(targetfilename, content);
        log(`写入 ${title} 成功`);
      } else {
        log(`${title} 已存在`, 'red');
      }
    });
}