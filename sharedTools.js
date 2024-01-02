const isBackground = location.protocol === "chrome-extension:";

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
  /(?:.+)?wwwperf\.brandeu(?:author)?lb\.ford\.com(?:\/(editor\.html|cf#))?(\/content\/guxeu(?:-beta)?\/(\w\w|mothersite)\/(?:(\w\w)_\w\w|configuration)\/(?:.*?))(?:\.html)?$/gm;

const touch = "editor.html";
const classic = "cf#";

const ifPerfProd = (url) => url.match(regexPerfProd);
const ifPerf = (url) => url.replace(regexPerfProd, "$1") === "perf";
const ifProd = (url) => url.replace(regexPerfProd, "$1") === "prod";

const authorClassic = function (url) {
  return url.replace(regexAuthor, "$1") === classic;
};
const authorTouch = function (url) {
  return url.replace(regexAuthor, "$1") === touch;
};

const GUX3 = function () {
  return document.querySelector("#accelerator-page");
};

const GUX1 = function () {
  return document.querySelector("#global-ux");
};

const nextGen = function () {
  return document.querySelector("#nextgen-page");
};

const regexJira = /jira\.uhub\.biz\/browse\//gm;

const regexRemoveSpaces = /^\s+|\s+$|\s+(?=\s)/gm;

const AEMLink = function (toEnv, url = null) {
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

    const properties = function (env) {
      let toAuthor = null;

      if (new.target) {
        toAuthor = env === touch || env === classic;
      }

      function changeMarket(author, other) {
        if (toAuthor) {
          return author;
        } else {
          return other;
        }
      }

      this.uk = function () {
        return changeMarket("en", "co");
      };

      this.ie = function () {
        return changeMarket("en", "");
      };

      this.fr = function () {
        return changeMarket("fr", "");
      };

      this.lu = function () {
        return changeMarket("fr", "");
      };

      this.de = function () {
        return changeMarket("de", "");
      };

      this.at = function () {
        return changeMarket("de", "");
      };

      this.dk = function () {
        return changeMarket("da", "");
      };

      this.cz = function () {
        return changeMarket("cs", "");
      };

      this.gr = function () {
        return changeMarket("el", "");
      };

      this.fi = function () {
        return changeMarket("fi", "");
      };

      this.hu = function () {
        return changeMarket("hu", "");
      };

      this.ro = function () {
        return changeMarket("ro", "");
      };

      this.es = function () {
        return changeMarket("es", "");
      };

      this.nl = function () {
        return changeMarket("nl", "");
      };

      this.it = function () {
        return changeMarket("it", "");
      };

      this.no = function () {
        return changeMarket("no", "");
      };

      this.pt = function () {
        return changeMarket("pt", "");
      };

      this.pl = function () {
        return changeMarket("pl", "");
      };
    };
    const fixLLdata = new properties(this.env);

    const funcProp = fixLLdata[this.market];
    if (funcProp !== undefined) {
      this.localLanguage = funcProp();
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

    let html = null;
    const currTabUrl = (await getCurrentTab()).url;
    if (!currTabUrl.match(regexAuthor)) {
      const regexDeleteEnv = /\/(?:editor\.html|cf#)/gm;
      const toEnvUrl = url.replace(regexDeleteEnv, "");

      const response = await fetch(toEnvUrl, {
        headers: {
          "User-Agent": "request",
        },
        timeout: 5000,
      });
      html = await response.text();
    }

    const callback = await browser.tabs.sendMessage(tab.id, {
      from: "background",
      subject: "getRealUrl",
      html,
    });
    this.urlPart = this.fixUrlPart(callback);

    return this.urlPart;
  };

  if (new.target) {
    if (toEnv === null) {
      throw new Error("env is not defined!");
    }
    this.env = toEnv;

    if (url === null) {
      return;
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
  } else {
    throw new Error("AEMLink should only be used with new!");
  }
};

if (!isBackground) {
  HTMLElement.prototype.addSharedDivClasses = function () {
    const commonClassesDiv = [
      "box",
      "box-black-background",
      "box-regular-top-padding",
      "box-regular-bottom-padding",
      "box-small-left-right-padding",
      "richtext",
      "richtext-white",
      "nextgen-white-color",
    ];

    commonClassesDiv.forEach((clas) => {
      this.classList.add(clas);
    });
  };

  HTMLElement.prototype.addBetaToLink = function () {
    const regexDetermineBeta = /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
    this.href = this.href.replace(regexDetermineBeta, `$1/${touch}$2`);
  };
}

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

const waitForElm = function (selector, doc = null) {
  if (doc === null) {
    doc = document;
  }

  return new Promise((resolve) => {
    if (doc.querySelector(selector)) {
      return resolve(doc.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (doc.querySelector(selector)) {
        resolve(doc.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
    });
  });
};

const loadSavedData = function () {
  return browser.storage.sync.get({
    disCreateWF: false,
    disMothersiteCheck: false,
    enableFunErr: false,
    enableFiltreFix: false,
    enableAutoLogin: false,
  });
};

const isFunction = function (functionToCheck) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
  );
};

const getCurrentTab = async function (returnUrl = false) {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];

  if (returnUrl) {
    return tab.url;
  }
  return tab;
};
