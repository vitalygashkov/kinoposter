(() => {
  const extractVariable = async (name) => {
    const array = new Uint32Array(5);
    const handshake = window.crypto.getRandomValues(array).toString();

    function propagateVariable(handshake, name) {
      const message = { handshake };
      message[name] = window[name];
      window.postMessage(message, '*');
    }

    const script = `( ${propagateVariable.toString()} )('${handshake}', '${name}');`;
    const scriptTag = document.createElement('script');
    const scriptBody = document.createTextNode(script);

    scriptTag.id = 'chromeExtensionDataPropagator';
    scriptTag.appendChild(scriptBody);
    document.body.append(scriptTag);

    const promise = new Promise((resolve) => {
      const listener = ({ data }) => data.handshake === handshake && resolve(data);
      window.addEventListener('message', listener, false);
    });
    return promise.then((data) => data[name]);
  };

  const download = async (url, filename) => {
    const blob = await fetch(url).then((res) => res.blob());
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
  };

  const parseUrl = async () => {
    const href = document.querySelector('link[rel="canonical"]').href;
    const { pathname } = new URL(href);
    const id = pathname.split('/').find((part) => part.match(/\d+/));
    const __NEXT_DATA__ = await extractVariable('__NEXT_DATA__');
    const apolloStateData = __NEXT_DATA__.props.apolloState.data;
    const apolloStateDataKey = Object.keys(apolloStateData).find((key) => key.endsWith(id));
    if (!apolloStateDataKey) return { url: null, filename: null };
    const posterAvatarsUrl = __NEXT_DATA__.props.apolloState.data[apolloStateDataKey]['poster']['avatarsUrl'];
    const posterUrlWithProtocol = posterAvatarsUrl.startsWith('//') ? `https:${posterAvatarsUrl}` : posterAvatarsUrl;
    const resolution = '600x900';
    const url = `${posterUrlWithProtocol}/${resolution}`;
    const filename = `${posterAvatarsUrl.split('/').at(-1) || id}.jpg`;
    return { url, filename };
  };

  const createButton = (text, action) => {
    const hasHref = typeof action === 'string';
    const hasClickHandler = typeof action === 'function';

    const ratingElement = document.querySelector('div.film-rating');
    const ratingRootElement = ratingElement.parentNode;
    const rateFilmButton = ratingRootElement.querySelector('button');

    const button = rateFilmButton.cloneNode(true);
    button.textContent = text;
    button.style.marginTop = '12px';
    if (hasClickHandler) button.addEventListener('click', action);
    if (!hasHref) return button;

    const link = document.createElement('a');
    link.style.textDecoration = 'none';
    link.href = action;
    link.target = '_blank';
    link.appendChild(button);
    return link;
  };

  const renderButtons = async () => {
    const posterImage = document.querySelector('img.film-poster');
    const posterLink = posterImage.parentNode;
    const posterRoot = posterLink.parentNode;
    const previousButtons = posterRoot.querySelectorAll('button');
    for (const button of previousButtons) button.remove();

    const { url, filename } = await parseUrl();
    if (!url) {
      const refreshButton = createButton('Обновить для загрузки постера', () => window.location.reload());
      posterRoot.appendChild(refreshButton);
      return;
    }

    const downloadButton = createButton('Скачать постер', () => download(url, filename));
    posterRoot.appendChild(downloadButton);

    const openButton = createButton('Открыть постер', url);
    posterRoot.appendChild(openButton);
  };

  navigation.addEventListener('navigate', () => {
    setTimeout(() => renderButtons(), 1000);
  });

  renderButtons();
})();
