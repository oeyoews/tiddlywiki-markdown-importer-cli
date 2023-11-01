import fs from 'fs';
import matter from 'gray-matter';
import filterNonStringValues from './filterfrontmatter';
import formattime from '../formattime';

export function importfile(
  title: string,
  filePath: string,
  index: number,
  writefiles: any,
  url: string,
  username: string,
  progressBar: any,
) {
  const text = fs.readFileSync(filePath, 'utf-8');
  // TODO: content 首行不会被去除
  const { data, content } = matter(text);
  if (!data) return;

  if (data?.title) {
    title = data.title;
  }

  const filteredData = filterNonStringValues(data);

  // record files
  if (writefiles.has(title)) {
    return;
  } else {
    writefiles.set(title, filePath);
  }
  const { birthtime, mtime } = fs.statSync(filePath);
  const created = formattime(birthtime);
  const modified = formattime(mtime);

  // TODO: 测试是否可以自动递归目录
  const putTiddlerUrl = new URL(`recipes/default/tiddlers/${title}`, url);

  const tiddler = {
    text: content,
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
        return;
      } else {
        // @ts-ignore
        write(putTiddlerUrl, tiddler, title);
        progressBar.update(index, { title });
      }
    });
}
