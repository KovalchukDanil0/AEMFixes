try {
  importScripts(
    "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
    "./sharedTools.js",
    "./node_modules/js-convert-case/dist/js-convert-case.js"
  );
} catch (e) {
  throw new Error(e);
}

async function ToEnvironment(tab, url, env, newTab) {
  let data = {
    market: "",
    localLanguage: "",
    beta: "",
    urlPart: "",
    ifSameEnv: false,

    isMarketInBeta: function () {
      if (marketsInBeta.some((link) => this.market.includes(link))) {
        this.beta = "-beta";
        return true;
      } else {
        this.beta = "";
        return false;
      }
    },

    fixMarket: function () {
      const marketsFixAuthor = ["gb", "gl"];
      const marketsFixPerf = ["uk", "mothersite"];

      let idx = marketsFixAuthor.indexOf(this.market);
      if (idx >= 0) {
        this.market = marketsFixPerf[idx];
        return this.market;
      }

      idx = marketsFixPerf.indexOf(this.market);
      if (idx >= 0) {
        this.market = marketsFixAuthor[idx];
        return this.market;
      }

      console.log("fixed market is " + this.market);
      return this.market;
    },

    fixLocalLanguage: function (env) {
      if (env == "editor.html" || env == "cf#") {
        if (this.localLanguage == "") this.localLanguage = this.market;

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
        }

        if (this.localLanguage == this.market) this.localLanguage = "";
      }

      console.log("fixed localLanguage is " + this.localLanguage);
      return this.localLanguage;
    },

    fixUrlPart: function () {
      const regexFixSWAuthor =
        /(?:\S+)?(site-wide-content|home)(\S+?(?=\.html)|\S+)(?:\S+)?/gm;

      if (this.urlPart.replace(regexFixSWAuthor, "$1") == "site-wide-content") {
        this.urlPart = this.urlPart.replace(regexFixSWAuthor, "/content$2");
      } else {
        this.urlPart = this.urlPart.replace(regexFixSWAuthor, "$2");
      }

      console.log("fixed url is " + this.urlPart);
      return this.urlPart;
    },
  };

  return new Promise((resolve, reject) => {
    (async () => {
      browser.runtime.sendMessage({
        from: "background",
        subject: "showMessage",
        message: "PLEASE WAIT",
        time: Number.MAX_VALUE,
      });

      let parser = new URL(url);
      data.urlPart = parser.pathname + parser.search + parser.hash;

      // Live
      if (url.match(regexLive)) {
        if (url.match(/www\.ford\.\w\w\.\w\w/gm)) {
          data.market = url.replace(regexLive, "$3");
          data.localLanguage = url.replace(regexLive, "$2");
        } else {
          data.market = url.replace(regexLive, "$2");
          data.localLanguage = url.replace(regexLive, "$1");
        }

        data.isMarketInBeta();
      }
      // Perf & Prod
      else if (url.match(regexPerfProd)) {
        if (
          url.match(/www(?:perf|prod)(?:-beta)?-couk\.brandeulb\.ford\.com/gm)
        ) {
          data.market = url.replace(regexPerfProd, "$3");
          data.localLanguage = url.replace(regexPerfProd, "$2");
        } else {
          data.market = url.replace(regexPerfProd, "$2");
          data.localLanguage = url.replace(regexPerfProd, "$3");
        }

        data.isMarketInBeta();
      }
      // Author
      else if (url.match(regexAuthor)) {
        data.market = url.replace(regexAuthor, "$3");
        data.localLanguage = url.replace(regexAuthor, "$4");

        data.fixLocalLanguage(env);
        data.ifSameEnv = true;

        if (data.isMarketInBeta()) {
          data.urlPart = undefined;
          data.urlPart = await browser.tabs.sendMessage(tab.id, {
            from: "popup",
            subject: "getAlias",
          });
        }

        data.fixUrlPart();
      }

      determineEnv();
    })();

    function determineEnv() {
      if (data.market == "") reject(new Error("Market is not set!"));

      //window.close();

      switch (env) {
        case "live":
          makeLive();
          break;
        case "perf":
        case "prod":
          makePerf();
          break;
        case "editor.html":
        case "cf#":
          makeAuthor();
          break;
        default:
          reject(new Error("No such environment"));
      }
    }

    function makeLive() {
      let britain = "";
      if (data.market == "uk") {
        britain = data.market;
        data.market = data.localLanguage + ".";
        data.localLanguage = "";
      }

      if (data.localLanguage != "") data.localLanguage += ".";

      ifOpenNewTab(
        "https://www." +
          data.localLanguage +
          "ford." +
          data.market +
          britain +
          data.urlPart
      );
    }

    function makePerf() {
      if (data.market == "uk" || data.market == "gb") {
        [data.localLanguage, data.market] = [data.market, data.localLanguage];
      }

      ifOpenNewTab(
        "https://www" +
          env +
          data.beta +
          "-" +
          data.market +
          data.localLanguage +
          ".brandeulb.ford.com" +
          data.urlPart
      );
    }

    async function makeAuthor() {
      let wrongLink =
        "/content/guxeu" +
        data.beta +
        "/" +
        data.market +
        "/" +
        data.fixLocalLanguage(env) +
        "_" +
        data.fixMarket() +
        "/home" +
        data.urlPart;

      const regexFixSiteWide =
        /((?:\S+)?\/content\/guxeu(?:-beta)?\/\w\w\/\w\w_\w\w)(\/home\/)(content)?(\S+)?/gm;
      if (wrongLink.replace(regexFixSiteWide, "$3") == "content") {
        wrongLink = wrongLink.replace(
          regexFixSiteWide,
          "$1/site-wide-content$4"
        );
      }

      if (data.beta == "-beta" && data.urlPart != "" && !data.ifSameEnv) {
        let response = await fetch(
          "https://wwwperf.brandeuauthorlb.ford.com/bin/guxacc/tools/customslingresresolver?page-path=" +
            wrongLink,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        let customResolverData = await response.json();

        makeRealAuthorLink(customResolverData["map"]["originalPath"]);
      } else {
        makeRealAuthorLink(wrongLink);
      }
    }

    function makeRealAuthorLink(wrongLink) {
      ifOpenNewTab(
        "https://wwwperf.brandeuauthorlb.ford.com/" + env + wrongLink + ".html"
      );
    }

    function ifOpenNewTab(newUrl) {
      if (newTab) {
        browser.tabs.create({ url: newUrl, index: tab.index + 1 });
      } else {
        browser.tabs.update(tab.id, {
          url: newUrl,
        });
      }

      resolve();
    }
  });
}

async function ExecuteOnEachTab(func, newTab, ...args) {
  let tabs = await browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });
  for (const tab of tabs) {
    await func(tab, tab.url, ...args, newTab);
  }

  browser.runtime.sendMessage({
    from: "background",
    subject: "showMessage",
    message: "ALL GOOD!!!",
    time: Number.MAX_VALUE,
  });
}

function openPropertiesTouchUI(tab) {
  let newUrl = tab.url.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$2"
  );

  browser.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
}

function CopyAllLinks() {
  let highlightedPageLinks;

  let tabs = browser.tabs.query({ highlighted: true, currentWindow: true });

  for (const element of tabs) {
    const tab = element;
    let url = tab.url;

    highlightedPageLinks += url + "\n\n";
    navigator.clipboard.writeText(highlightedPageLinks);

    ShowMessage("LINKS COPIED TO CLIPBOARD:\n" + highlightedPageLinks);
  }
}

browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.from === "popup" && msg.subject === "buttonClick") {
    msg.func = this[msg.func];

    if (!msg.once) {
      ExecuteOnEachTab(msg.func, msg.newTab, ...msg.args);
    } else msg.func(...msg.args);
  }
});

browser.contextMenus.onClicked.addListener(menusOnClick);

function menusOnClick(info) {
  switch (info.menuItemId) {
    case "camelCase":
      console.log(jsConvert.toCamelCase("param-case"));
      break;
    default:
      console.log("Standard context menu item clicked.");
  }
}
browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "toCamelCase",
    contexts: ["selection"],
    id: "camelCase",
  });
});
