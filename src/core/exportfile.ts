import { log } from '../lib/log';
import dayjs from 'dayjs';
import matter from 'gray-matter';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

/**
 * @description: 从服务端 导出 tiddler 为 markdown
 * @param baseurl
 * @param twpath
 * @param title
 * @param markdowntype
 */
export function exportFile(
  baseurl: string,
  twpath: string,
  title: string,
  markdowntype: any[],
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

      const { text, fiedls, ...frontmatter } = data;

      if (!markdowntype.includes(frontmatter?.type)) {
        log(`${title} 不是 markdown 类型`, 'red');
        return;
      }

      // update date field
      frontmatter.date = dayjs(frontmatter.created, 'YYYYMMDDHHmmssSSS').format(
        'YYYY-MM-DD',
      );

      // remove created field
      delete frontmatter.created;

      // remove empty tags
      !frontmatter.tags && delete frontmatter.tags;

      const filteredFrontmatter = Object.keys(frontmatter)
        .filter((key) => {
          return (
            key === 'title' ||
            key === 'tags' ||
            key === 'date' ||
            key === 'description'
          );
        })
        .reduce((obj: any, key) => {
          // 将满足条件的字段添加到新的对象中
          obj[key] = frontmatter[key];
          return obj;
        }, {});

      const content = matter.stringify(
        { content: `\n${text}` },
        filteredFrontmatter,
      );

      const fileName = `${slugify(title, {
        lower: true,
        remove: /[*+~./()'"!:@]/g,
      })}.md`;
      const targetfilename = path.join(twpath, fileName);

      if (!fs.existsSync(targetfilename)) {
        fs.writeFileSync(targetfilename, content);
      } else {
        log(`${title} 已存在`, 'red');
      }
    });
}
