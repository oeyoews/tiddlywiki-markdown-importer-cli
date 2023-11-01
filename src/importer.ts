import { log } from './lib/log';

export default (url: URL, tiddler: { title: string }, title: string) => {
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
