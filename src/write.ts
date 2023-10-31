import chalk from 'chalk';

export default (url: URL, tiddler: { title: string }) => {
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-requested-with': 'TiddlyWiki',
    },
    body: JSON.stringify(tiddler),
  }).then(() => {
    console.log(chalk.green.bold(`已成功写入`));
  });
};
