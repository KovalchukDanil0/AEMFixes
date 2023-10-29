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

function ifWorkflow(url) {
  return url.match(regexWorkflow);
}

function ifWCMWorkflows(url) {
  return url.match(regexWCMWorkflows);
}

function ifInbox(url) {
  return url.match(regexInbox);
}

function ifResourceResolver(url) {
  return url.match(regexResourceResolver);
}

function ifFindAndReplace(url) {
  return url.match(regexFindAndReplaceLinks);
}

function ifLogInForm(url) {
  return url.match(regexLogInForm);
}

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

function waitForElm(selector) {
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
}

async function loadSavedData() {
  return await browser.storage.sync.get({ disableCreateWF: true });
}
