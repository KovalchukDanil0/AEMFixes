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
  /(.+wwwperf\.brandeuauthorlb\.ford\.com\/siteadmin#)\/content.+/gm;
const regexDAMTree =
  /(.+wwwperf\.brandeuauthorlb\.ford\.com\/damadmin#)(\/content\/dam\/guxeu(?:-beta)?\/(?:\w\w|rhd)\/(?:\w\w_\w\w|central)\/(?:(mavs)\/)?(?:.+)?)/gm;
const regexLogInForm =
  /corpqa\.sts\.ford\.com\/adfs\/ls|corp\.sts\.ford\.com\/adfs\/oauth2\/authorize/gm;

const regexUrlPart = /(http(?:s)?:\/\/)?([^/\s]+)(.*)/gm;

const regexLive =
  /(?:.+)?(?:secure|www)(?:\.(\w\w))?\.ford\.(\w\w)(?:\.(\w\w))?(?:.+)?/gm;
const regexPerfProd =
  /(?:.+)?www(perf|prod)(?:-beta)?-(\w\w)(\w\w)?\.brandeulb\.ford\.com(?:.+)?/gm;

const regexAuthor =
  /(?:.+)?wwwperf\.brandeu(?:author)?lb\.ford\.com(?:\/(editor\.html|cf#))?(\/content\/guxeu(?:-beta)?\/(\w\w|mothersite)\/(?:(\w\w)_\w\w|configuration)\/(?:.+)?)(?:\.html|\/)(?:.+)?/gm;

const touch = "editor.html";
const classic = "cf#";

const authorClassic = function (url) {
  return url.replace(regexAuthor, "$1") === classic;
};
const authorTouch = function (url) {
  return url.replace(regexAuthor, "$1") === touch;
};

const GUX3 = function () {
  const page = document.getElementById("accelerator-page");
  return page !== null;
};

const GUX1 = function () {
  const page = document.getElementById("global-ux");
  return page !== null;
};

const regexJira = /jira\.uhub\.biz\/browse\//gm;

const regexRemoveSpaces = /^\s+|\s+$|\s+(?=\s)/gm;

const AEMLink = function (url, toEnv = null) {
  this.env = "";
  this.market = "";
  this.localLanguage = "";
  this.beta = "";
  this.betaBool = false;
  this.urlPart = "";
  this.authorBeta = false;
  this.fastAuthor = false;

  this.marketsInBeta = [
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
  this.marketsHomeNew = ["ie", "fi", "be", "cz", "hu", "gr", "ro", "lu"];

  this.isMarketInBeta = function (someMarket = null) {
    const returnNotThis = someMarket !== null;
    if (returnNotThis) {
      this.market = someMarket;
    }

    this.betaBool = !!this.marketsInBeta.some((link) =>
      this.market.includes(link)
    );
    this.beta = this.betaBool ? "-beta" : "";

    if (returnNotThis) {
      return this.betaBool;
    }

    return this;
  };

  this.isMarketHasHomeNew = function () {
    return !!this.marketsHomeNew.some((mar) => this.market.includes(mar));
  };

  this.fixMarket = function (someMarket = null) {
    if (someMarket !== null) {
      this.market = someMarket;
    }

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

    return this.market;
  };

  this.fixLocalLanguage = function (someLocalLang = null) {
    if (someLocalLang !== null) {
      this.localLanguage = someLocalLang;
    }

    if (this.env === touch || this.env === classic) {
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
        default:
          break;
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
        default:
          break;
      }

      if (this.localLanguage === this.market) {
        this.localLanguage = "";
      }
    }

    return this.localLanguage;
  };

  this.fixUrlPart = function (someUrlPart = null) {
    if (someUrlPart !== null) {
      this.urlPart = someUrlPart;
    }

    const regexFixSWAuthor =
      /\S+?(site-wide-content|home-new|home)((?:\S+)?(?=\.html)|\S+)(?:\S+)?/gm;

    if (this.urlPart.replace(regexFixSWAuthor, "$1") === "site-wide-content") {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "/content$2");
    } else {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "$2");
    }

    return this.urlPart;
  };

  this.getAuthorRealUrl = async function (tab) {
    if (!this.authorBeta) {
      return this.urlPart;
    }

    // TODO: fix headers sometimes not given correctly

    console.log(url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "request",
      },
    });
    const html = await response.text();

    const callback = await browser.tabs.sendMessage(tab.id, {
      from: "background",
      subject: "DOMParser",
      selector: 'head > meta[name="og:url"]',
      property: "content",
      html,
    });

    this.urlPart = this.fixUrlPart(callback);
    return this.urlPart;
  };

  if (new.target) {
    if (toEnv !== null) {
      this.env = toEnv;
    }

    const parser = new URL(url);
    this.urlPart = parser.pathname + parser.search + parser.hash;
    if (this.urlPart === "/") {
      this.urlPart = "";
    }

    let isAuthor = false;

    // Live
    if (url.match(regexLive)) {
      if (url.replace(regexLive, "$3") === "") {
        this.market = url.replace(regexLive, "$2");
        this.localLanguage = url.replace(regexLive, "$1");
      } else {
        this.market = url.replace(regexLive, "$3");
        this.localLanguage = url.replace(regexLive, "$2");
      }
    }
    // Perf & Prod
    else if (url.match(regexPerfProd)) {
      if (url.replace(regexPerfProd, "$3") === "uk") {
        this.market = url.replace(regexPerfProd, "$3");
        this.localLanguage = url.replace(regexPerfProd, "$2");
      } else {
        this.market = url.replace(regexPerfProd, "$2");
        this.localLanguage = url.replace(regexPerfProd, "$3");
      }
    }
    // Author
    else if (url.match(regexAuthor)) {
      if (this.env === classic || this.env === touch) {
        this.fastAuthor = true;
        return this;
      }

      this.market = url.replace(regexAuthor, "$3");
      this.localLanguage = this.fixLocalLanguage(
        url.replace(regexAuthor, "$4")
      );

      isAuthor = true;
    } else {
      throw new Error("Link doesn't math any of the env");
    }

    this.isMarketInBeta();
    if (isAuthor) {
      if (this.betaBool) {
        this.authorBeta = true;
      } else {
        this.fixUrlPart();
      }
    }

    return this;
  }
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
  const savedData = await browser.storage.sync.get("savedData");
  return savedData.savedData;
};

const isFunction = function (functionToCheck) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
  );
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

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from === "background") {
    if (msg.subject === "DOMParser") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(msg.html, "text/html");
      const elm = doc.querySelector(msg.selector);

      console.log(doc);

      sendResponse(elm[msg.property]);
    }

    if (msg.subject === "writeToClipboard") {
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
  }
});
