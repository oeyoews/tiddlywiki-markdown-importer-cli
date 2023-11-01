#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readDirRecursive from './lib/getallfiles';
import { log } from './lib/log';
import { importFile } from './core/importfile';
import { progressBar } from './lib/progressbar';

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Put%20Tiddler

export default ({ host, port, twpath, username }: ActionOptions) => {
  const markdowntypes = ['.md', '.markdown'];
  const baseurl = `${host}:${port}`;

  const targetdir = path.resolve('.', twpath);
  const files = readDirRecursive(targetdir);
  const markdownFiles = files.filter(({ filetype }) =>
    markdowntypes.includes(filetype),
  );

  if (!fs.existsSync(twpath)) {
    log(`文件夹 ${twpath} 不存在`, 'red');
    throw new Error('文件夹不存在');
  }

  progressBar.start(markdownFiles.length, 0, { title: '', type: '' });

  markdownFiles.forEach(({ filename: title, filePath }, index) => {
    progressBar.update(index, { title, type: 'Importing:' });
    importFile(baseurl, filePath, title, username);
    progressBar.update(index + 1, { title });
  });
};
