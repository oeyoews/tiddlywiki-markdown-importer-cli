import fs from 'fs';
import { log } from './lib/log';
import { exportFile } from './core/exportfile';
import { progressBar } from './lib/progressbar';

export default ({ host, port, twpath }: ActionOptions) => {
  const baseurl = `${host}:${port}`;
  const markdowntype = ['text/markdown', 'text/x-markdown'];

  // 如果你构建了在线的tiddlers.json, 也可以直接使用那个地址, 可以使用tiddlyhost 测试, 默认提供tiddlers.json
  // https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20All%20Tiddlers

  if (fs.existsSync(twpath)) {
    fs.rmSync(twpath, { recursive: true, force: true });
  }
  fs.mkdirSync(twpath);

  const tiddlersjsonurl = new URL(`/recipes/default/tiddlers.json`, baseurl);

  const markdownfiletitles: string[] = [];

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
    .then(() => {
      markdownfiletitles.forEach((title, index) => {
        progressBar.start(markdownfiletitles.length, index, {
          title,
          type: '',
        });
        exportFile(baseurl, twpath, title, markdowntype);
        progressBar.update(index + 1, { title, type: 'Exporting:' });
      });
    })
    .then(() => {
      progressBar.stop();
      log(`\n共有 ${markdownfiletitles.length} 个 tiddler`, 'cyan');
    });
};
