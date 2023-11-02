import { IServerStatus } from 'tiddlywiki';

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20Server%20Status
export function getStatus(baseurl: string): Promise<IServerStatus> {
  const url = new URL(`/status`, baseurl);

  return fetch(url)
     .then((res) => {
       return res.json();
     })
     .then((data: IServerStatus) => {
       if (!data) throw new Error('Failed to fetch status');
       return data;
     });
}
