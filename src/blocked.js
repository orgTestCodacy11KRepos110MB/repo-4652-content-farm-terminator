const urlObj = new URL(location.href);
const sourceUrl = urlObj.searchParams.get('to');
const sourceUrlObj = new URL(sourceUrl);

function recheckBlock() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      cmd: 'isUrlBlocked',
      args: {url: sourceUrl}
    }, resolve);
  }).then((isBlocked) => {
    if (!isBlocked) {
      location.replace(sourceUrl);
    }
  });
}

document.addEventListener('DOMContentLoaded', (event) => {
  utils.loadLanguages(document);

  if (urlObj.searchParams.get('type') == 2) {
    let u = sourceUrlObj;
    u = u.protocol + '//' + 
        (u.username ? u.username + (u.password ? ':' + u.password : '') + '@' : '') + 
        punycode.toUnicode(u.hostname) + 
        (u.port ? ':' + u.port : '') + 
        u.pathname + u.search + u.hash;
    const elem = document.createElement('span');
    elem.textContent = u;
    elem.style.fontSize = '0.8em';
    document.querySelector('#warningUrl').appendChild(elem);
  } else {
    document.querySelector('#warningUrl').textContent = punycode.toUnicode(sourceUrlObj.hostname);
  }

  /**
   * Events
   */
  document.querySelector('#view').addEventListener('click', (event) => {
    const newUrl = `sandbox.html?src=${encodeURIComponent(sourceUrl)}`;
    location.replace(newUrl);
  });

  document.querySelector('#back').addEventListener('click', (event) => {
    if (history.length > 1) {
      history.go(-1);
    } else {
      chrome.tabs.getCurrent((tab) => {
        chrome.runtime.sendMessage({
          cmd: 'closeTab',
          args: {tabId: tab.id}
        });
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.warn("omMessage", message);
  const {cmd, args} = message;
  switch (cmd) {
    case 'updateContent': {
      recheckBlock();
      sendResponse(true);
      break;
    }
  }
});
