const baseurl = 'http://0.0.0.0:8000';
const url = new URL(`/status`, baseurl);

// https://bramchen.github.io/tw5-docs/zh-Hans/#WebServer%20API%3A%20Get%20Server%20Status
fetch(url)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    // if (data) log('获取状态成功', 'green');
    if (!data) return false;
    // const {
    //   username,
    //   anonymous,
    //   logout_is_available,
    //   space,
    //   tiddlywiki_version,
    // } = data;
    return data;
  });
