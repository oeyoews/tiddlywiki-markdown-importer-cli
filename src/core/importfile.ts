import fs from 'fs';
import matter from 'gray-matter';
import filterNonStringValues from '../lib/filterfrontmatter';
import formattime from '../lib/formatedtime';
import { log } from '../lib/log';

/**
 * @description 从本地 markdown 文件导入 tiddler
 * @param title
 * @param filePath
 * @param index
 * @param writefiles
 * @param baseurl
 * @param username
 * @param progressBar
 * @returns
 */
export function importFile(
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
        writefile(putTiddlerUrl, tiddler, title);
        progressBar.update(index, { title });
      }
    });
}

const writefile = (url: URL, tiddler: { title: string }, title: string) => {
  const body = JSON.stringify(tiddler);
  const requestOptions = {
    method: 'PUT',
    // https://github.com/Jermolene/TiddlyWiki5/blob/4b56cb42983d4134715eb7fe7b083fdcc04980f0/plugins/tiddlywiki/tiddlyweb/tiddlywebadaptor.js#L149
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    body,
  };
  fetch(url, requestOptions).then((res) => {
    if (!res.ok) log(`写入 ${title} 失败`, 'red');
  });
};
