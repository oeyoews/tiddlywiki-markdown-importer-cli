import matter from 'gray-matter';
import fs from 'fs';
import chalk from 'chalk';

const baseurl = 'http://0.0.0.0:8000';
const title = '关于梦';
const type = ['text/markdown', 'text/x-markdown'];

// TODO: 异常处理
const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, baseurl);

fetch(putTiddlerUrl)
  .then((res) => {
    if (res.ok) return res.json();
    return false;
  })
  .then((data) => {
    if (!data) {
      console.log(chalk.red.bold(`获取 ${title} 失败`));
      return;
    }
    const { text, fields, ...frontmatter } = data;
    if (!type.includes(frontmatter?.type)) return;
    // TODO: 过滤空的属性
    const content = matter.stringify(
      { content: `\n${text}` },
      Object.assign({}, frontmatter, fields),
    );
    if (fs.existsSync(`content/${title}`)) return;
    fs.writeFileSync(`content/${title}.md`, content);
    console.log(chalk.green.bold(`写入 ${title} 成功`));
  });
