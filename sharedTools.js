const regexWorkflow =
  /(?:.+)?wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/workflow\/packages\/ESM\/\w\w(?:(?:_)?\w\w)?(?:\/\w\w\w\w)?\/(.+)\.html(?:.+)?/gm;
const regexWCMWorkflows =
  /wwwperf\.brandeuauthorlb\.ford\.com\/miscadmin#\/etc\/workflow\/packages\/ESM\//gm;
const regexInbox = /wwwperf\.brandeuauthorlb\.ford\.com\/inbox/gm;
const regexResourceResolver =
  /wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/guxacc\/tools\/resource-resolvertool/gm;
const regexFindAndReplaceLinks =
  /wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/guxfoe\/tools\/find-replace-links/gm;
const regexLogInForm =
  /corpqa\.sts\.ford\.com\/adfs\/ls|corp\.sts\.ford\.com\/adfs\/oauth2\/authorize/gm;

const regexUrlPart = /(http(?:s)?:\/\/)?([^/\s]+)(.*)/gm;

const regexLive =
  /(?:.+)?(?:secure|www)(?:\.(\w\w))?\.ford\.(\w\w)(?:\.(\w\w))?(?:.+)?/gm;
const regexPerfProd =
  /(?:.+)?www(perf|prod)(?:-beta)?-(\w\w)(\w\w)?\.brandeulb\.ford\.com(?:.+)?/gm;
const regexAuthor =
  /(?:.+)?wwwperf\.brandeu(?:author)?lb\.ford\.com(?:\/(editor\.html|cf#))?(\/content\/guxeu(?:-beta)?\/(\w\w|mothersite)\/(\w\w)_\w\w\/(?:.+)?)(?:\.html|\/)(?:.+)?/gm;
const marketsInBeta = [
  "uk",
  "de",
  "es",
  "fr",
  "nl",
  "it",
  "no",
  "at",
  "pt",
  "pl",
  "dk",
];

const regexJira = /jira\.uhub\.biz\/browse\//gm;

String.prototype.isEmpty = function () {
  return this.trim().length === 0;
};

const ifWorkflow = function (url) {
  return url.match(regexWorkflow);
};

const ifWCMWorkflows = function (url) {
  return url.match(regexWCMWorkflows);
};

const ifInbox = function (url) {
  return url.match(regexInbox);
};

const ifResourceResolver = function (url) {
  return url.match(regexResourceResolver);
};

const ifFindAndReplace = function (url) {
  return url.match(regexFindAndReplaceLinks);
};

const ifLogInForm = function (url) {
  return url.match(regexLogInForm);
};

const getElementByXpath = function (path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const waitForElm = function (selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const loadSavedData = async function () {
  return browser.storage.sync.get({
    disableCreateWF: false,
    enableFunErr: false,
  });
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "background" && msg.subject === "writeToClipboard") {
    navigator.clipboard.writeText(msg.text);

    browser.runtime.sendMessage({
      from: "background",
      subject: "showMessage",
      message: `LINKS COPIED TO CLIPBOARD:\n ${msg.text}`,
      time: 5000,
    });
  }
});
