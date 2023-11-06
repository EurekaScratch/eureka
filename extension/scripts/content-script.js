const scriptElem = document.createElement('script');
scriptElem.setAttribute('type', 'text/javascript');
scriptElem.setAttribute('src', chrome.extension.getURL('/scripts/chibi.user.js'));
(document.head || document.documentElement).appendChild(scriptElem);
