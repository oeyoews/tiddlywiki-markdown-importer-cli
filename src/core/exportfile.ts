import { log } from '../lib/log';
import matter from 'gray-matter';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

export function getfile(
  title: string,
  markdowntype: any[],
  baseurl: string,
  fileExtension: string,
  exportPath: string,
) {
  const putTiddlerUrl = new URL(`/recipes/default/tiddlers/${title}`, baseurl);
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
