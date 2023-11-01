// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20Server%20Status
export function getStatus(baseurl: string) {
  const url = new URL(`/status`, baseurl);
  let statusinfo: IStatus | undefined;

  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (!data) return;
      statusinfo = data;
    });

  return statusinfo;
}
