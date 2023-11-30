const regexWorkflow =
  /(?:.+)?wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/workflow\/packages\/ESM\/(\w\w)(?:_)?(\w\w)?(?:\/\w\w(\w\w))?\/(.+)\.html(?:.+)?/gm;
const regexWCMWorkflows =
  /wwwperf\.brandeuauthorlb\.ford\.com\/miscadmin#\/etc\/workflow\/packages\/ESM\//gm;
const regexInbox = /wwwperf\.brandeuauthorlb\.ford\.com\/inbox/gm;
const regexResourceResolver =
  /wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/guxacc\/tools\/resource-resolvertool/gm;
const regexFindAndReplaceLinks =
  /wwwperf\.brandeuauthorlb\.ford\.com(?:\/(?:editor\.html|cf#))?\/etc\/guxfoe\/tools\/find-replace-links/gm;
const regexAEMTree =
  /(.+wwwperf\.brandeuauthorlb\.ford\.com\/siteadmin#)(\/content.+)/gm;
const regexLogInForm =
  /corpqa\.sts\.ford\.com\/adfs\/ls|corp\.sts\.ford\.com\/adfs\/oauth2\/authorize/gm;

const regexUrlPart = /(http(?:s)?:\/\/)?([^/\s]+)(.*)/gm;

const regexLive =
  /(?:.+)?(?:secure|www)(?:\.(\w\w))?\.ford\.(\w\w)(?:\.(\w\w))?(?:.+)?/gm;
const regexPerfProd =
  /(?:.+)?www(perf|prod)(?:-beta)?-(\w\w)(\w\w)?\.brandeulb\.ford\.com(?:.+)?/gm;

const regexAuthor =
  /(?:.+)?wwwperf\.brandeu(?:author)?lb\.ford\.com(?:\/(editor\.html|cf#))?(\/content\/guxeu(?:-beta)?\/(\w\w|mothersite)\/(\w\w)_\w\w\/(?:.+)?)(?:\.html|\/)(?:.+)?/gm;
const authorClassic = function (url) {
  return url.replace(regexAuthor, "$1") === "cf#";
};
const authorTouch = function (url) {
  return url.replace(regexAuthor, "$1") === "editor.html";
};

const regexJira = /jira\.uhub\.biz\/browse\//gm;

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

// doesn't have ch
const marketsHomeNew = ["ie", "fi", "be", "cz", "hu", "gr", "ro", "lu"];

const AEMLink = {
  env: "",
  market: "",
  localLanguage: "",
  beta: "",
  betaBool: "",
  urlPart: "",
  ifSameEnv: false,

  isMarketInBeta(someMarket) {
    if (someMarket === undefined) {
      someMarket = this.market;
    }
    this.betaBool = !!marketsInBeta.some((link) => someMarket.includes(link));
    this.beta = this.betaBool ? "-beta" : "";
    return this.betaBool;
  },

  isMarketHasHomeNew() {
    return !!marketsHomeNew.some((mar) => this.market.includes(mar));
  },

  fixMarket() {
    const marketsFixAuthor = ["gb", "en", "gl"];
    const marketsFixPerf = ["uk", "uk", "mothersite"];

    let idx = marketsFixAuthor.indexOf(this.market);
    if (idx >= 0) {
      return marketsFixPerf[idx];
    }

    idx = marketsFixPerf.indexOf(this.market);
    if (idx >= 0) {
      return marketsFixAuthor[idx];
    }

    console.log(`fixed market is ${this.market}`);
    return this.market;
  },

  fixLocalLanguage() {
    if (this.env === "editor.html" || this.env === "cf#") {
      if (this.localLanguage === "") {
        this.localLanguage = this.market;
      }

      switch (this.market) {
        case "uk":
        case "ie":
          this.localLanguage = "en";
          break;
        case "lu":
          this.localLanguage = "fr";
          break;
        case "at":
          this.localLanguage = "de";
          break;
        case "dk":
          this.localLanguage = "da";
          break;
        case "cz":
          this.localLanguage = "cs";
          break;
        case "gr":
          this.localLanguage = "el";
          break;
        default: {
          console.warn(`This market ${this.market} doesn't exist`);
        }
      }
    } else {
      switch (this.market) {
        case "cz":
        case "gr":
        case "lu":
        case "ie":
        case "at":
        case "dk":
          this.localLanguage = "";
          break;
        case "uk":
          this.localLanguage = "co";
          break;
        default: {
          console.warn(`This market ${this.market} doesn't exist`);
        }
      }

      if (this.localLanguage === this.market) {
        this.localLanguage = "";
      }
    }

    console.log("fixed localLanguage is " + this.localLanguage);
    return this.localLanguage;
  },

  fixUrlPart() {
    const regexFixSWAuthor =
      /\S+?(site-wide-content|home-new|home)((?:\S+)?(?=\.html)|\S+)(?:\S+)?/gm;

    if (this.urlPart.replace(regexFixSWAuthor, "$1") === "site-wide-content") {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "/content$2");
    } else {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "$2");
    }

    console.log("fixed url is " + this.urlPart);
    return this.urlPart;
  },
};

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

const copyTextToClipboard = function (text) {
  const copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);

  copyFrom.select();
  document.execCommand("copy");

  copyFrom.blur();
  document.body.removeChild(copyFrom);
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "background" && msg.subject === "writeToClipboard") {
    copyTextToClipboard(msg.text);

    if (msg.showMessage) {
      browser.runtime.sendMessage({
        from: "background",
        subject: "showMessage",
        message: `LINKS COPIED TO CLIPBOARD:\n ${msg.text}`,
        time: 5000,
      });
    }
  }
});
