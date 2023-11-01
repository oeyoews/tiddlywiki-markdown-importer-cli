import chalk from 'chalk';

export default (url: URL, tiddler: { title: string }, title: string) => {
  const body = JSON.stringify(tiddler);
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    body,
  };
  fetch(url, requestOptions).then((res) => {
    if (!res.ok) console.log(chalk.red.bold(`写入 ${title} 失败`));
  });
};
