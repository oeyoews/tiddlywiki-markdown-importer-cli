import fs from 'fs';
import matter from 'gray-matter';
import filterNonStringValues from '../lib/filterfrontmatter';
import formattime from '../formattime';
import importer from '../importer';
import { log } from '../lib/log';

export function importfile(
  title: string,
  filePath: string,
  index: number,
  writefiles: any,
  baseurl: string,
  username: string,
  progressBar: any,
) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(text);
  if (!data) return;

  if (data?.title) {
    title = data.title;
  }

  const filteredData = filterNonStringValues(data);

  if (writefiles.has(title)) {
    return;
  } else {
    writefiles.set(title, filePath);
  }
  const { birthtime, mtime } = fs.statSync(filePath);
  const created = formattime(birthtime);
  const modified = formattime(mtime);

  const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, baseurl);

  const tiddler = {
    text: content.trim(), // 去除首行换行符
    type: 'text/markdown',
    created,
    creator: username,
    modified,
  };

  try {
    Object.assign(tiddler, filteredData);
  } catch (e) {
    e;
  }

  fetch(putTiddlerUrl)
    .then((res) => {
      let data;
      if (res.ok) {
        data = res.json();
        return data;
      }
      return false;
    })
    .then((data) => {
      if (data) {
        log(`${title} 已存在`, 'red');
        return;
      } else {
        // @ts-ignore
        importer(putTiddlerUrl, tiddler, title);
        progressBar.update(index, { title });
      }
    });
}
