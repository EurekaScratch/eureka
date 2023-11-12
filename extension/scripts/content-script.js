const scriptElem = document.createElement('script');
const extInstance = typeof browser !== 'undefined' ? browser : chrome;
scriptElem.setAttribute('type', 'text/javascript');
scriptElem.setAttribute('src', extInstance.runtime.getURL('/scripts/eureka-loader.user.js'));
(document.head || document.documentElement).appendChild(scriptElem);
