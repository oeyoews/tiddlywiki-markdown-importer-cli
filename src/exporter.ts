import matter from 'gray-matter';
import fs from 'fs';
import chalk, { Chalk } from 'chalk';
import path from 'path';

const baseurl = 'http://0.0.0.0:8000';
const title = '关于梦';
const type = ['text/markdown', 'text/x-markdown'];
const exportPath = 'content';

const log = (type: string, text: string) => {
  // @ts-ignore
  return console.log(chalk?.[type]?.bold(text));
};

// TODO: 异常处理
const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, baseurl);

fetch(putTiddlerUrl)
  .then((res) => {
    if (res.ok) return res.json();
    return false;
  })
  .then((data) => {
    if (!data) {
      log('red', `获取 ${title} 失败`);
      return;
    }

    const { text, fields, ...frontmatter } = data;

    if (!type.includes(frontmatter?.type)) {
      log('red', `${title} 不是 ${type}`);
      return;
    }

    // TODO: 过滤空的属性
    const mergedfrontmatter = Object.assign({}, frontmatter, fields);
    const content = matter.stringify(
      { content: `\n${text}` },
      mergedfrontmatter,
    );

    const targetfilename = path.join(exportPath, `${title}.md`);

    if (!fs.existsSync(targetfilename)) {
      fs.writeFileSync(targetfilename, content);
      log('green', `写入 ${title} 成功`);
    } else {
      log('red', `${title} 已存在`);
    }
  });
