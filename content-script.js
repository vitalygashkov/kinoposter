(() => {
  const href = document.querySelector('link[rel="canonical"]').href;
  const url = new URL(href);
  const id = url.pathname.split('/').find((part) => part.match(/\d+/));
  const __NEXT_DATA__ = JSON.parse(document.getElementById('__NEXT_DATA__').textContent);
  const apolloStateData = __NEXT_DATA__.props.apolloState.data;
  const apolloStateDataKey = Object.keys(apolloStateData).find((key) => key.endsWith(id));
  const posterAvatarsUrl = __NEXT_DATA__.props.apolloState.data[apolloStateDataKey]['poster']['avatarsUrl'];
  const posterUrlWithProtocol = posterAvatarsUrl.startsWith('//') ? `https:${posterAvatarsUrl}` : posterAvatarsUrl;
  const resolution = '600x900';
  const posterUrl = `${posterUrlWithProtocol}/${resolution}`;
  const posterFilename = `${posterAvatarsUrl.split('/').at(-1) || id}.jpg`;

  const posterImageElement = document.querySelector('img.film-poster');
  const posterLinkElement = posterImageElement.parentNode;
  const posterRootElement = posterLinkElement.parentNode;

  posterRootElement.style.cursor = 'pointer';
  posterRootElement.addEventListener('click', async () => {
    const blob = await fetch(posterUrl).then((res) => res.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = posterFilename;
    a.click();
  });
})();
