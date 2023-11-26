try {
  importScripts(
    "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
    "./sharedTools.js",
    "./node_modules/js-convert-case/dist/js-convert-case.js"
  );
} catch (e) {
  throw new Error(e);
}

async function toEnvironment(tab, url, env, newTab) {
  const data = AEMLink;
  data.env = env;
  console.log(data.env);

  return new Promise((resolve, reject) => {
    (async () => {
      browser.runtime.sendMessage({
        from: "background",
        subject: "showMessage",
        message: "PLEASE WAIT",
        time: Number.MAX_VALUE,
      });

      const parser = new URL(url);
      data.urlPart = parser.pathname + parser.search + parser.hash;
      if (data.urlPart === "/") {
        data.urlPart = "";
      }

      // Live
      if (url.match(regexLive)) {
        if (url.replace(regexLive, "$3") === "") {
          data.market = url.replace(regexLive, "$2");
          data.localLanguage = url.replace(regexLive, "$1");
        } else {
          data.market = url.replace(regexLive, "$3");
          data.localLanguage = url.replace(regexLive, "$2");
        }

        data.isMarketInBeta();
      }
      // Perf & Prod
      else if (url.match(regexPerfProd)) {
        if (url.replace(regexPerfProd, "$3") === "uk") {
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

        data.fixLocalLanguage();
        data.ifSameEnv = true;

        if (data.isMarketInBeta()) {
          data.urlPart = null;
          data.urlPart = await browser.tabs.sendMessage(tab.id, {
            from: "popup",
            subject: "getAlias",
          });
        }

        data.fixUrlPart();
      } else {
        throw new Error("Link doesn't math any of the env");
      }

      determineEnv();
    })();

    function determineEnv() {
      if (data.market === "") {
        reject(new Error("Market is not set!"));
      }

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
      if (data.market === "uk") {
        britain = data.market;
        data.market = data.localLanguage + ".";
        data.localLanguage = "";
      }

      if (data.localLanguage !== "") {
        data.localLanguage += ".";
      }

      ifOpenNewTab(
        `https://www.${data.localLanguage}ford.${data.market}${britain}${data.urlPart}`
      );
    }

    function makePerf() {
      if (data.market === "uk" || data.market === "gb") {
        [data.localLanguage, data.market] = [data.market, data.localLanguage];
      }

      ifOpenNewTab(
        `https://www${env}${data.beta}-${data.market}${data.localLanguage}.brandeulb.ford.com${data.urlPart}`
      );
    }

    async function makeAuthor() {
      let wrongLink = `/content/guxeu${data.beta}/${
        data.market
      }/${data.fixLocalLanguage()}_${data.fixMarket()}/${
        data.isMarketHasHomeNew() && data.urlPart === "" ? "home-new" : "home"
      }${data.urlPart}`;

      console.log(data.urlPart);

      const regexFixSiteWide =
        /((?:\S+)?\/content\/guxeu(?:-beta)?\/\w\w\/\w\w_\w\w)(\/home\/)(content)?(\S+)?/gm;
      if (wrongLink.replace(regexFixSiteWide, "$3") === "content") {
        wrongLink = wrongLink.replace(
          regexFixSiteWide,
          "$1/site-wide-content$4"
        );
      }

      if (data.beta === "-beta" && data.urlPart !== "" && !data.ifSameEnv) {
        const response = await fetch(
          "https://wwwperf.brandeuauthorlb.ford.com/bin/guxacc/tools/customslingresresolver?page-path=" +
            wrongLink,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const customResolverData = await response.json();

        makeRealAuthorLink(customResolverData["map"]["originalPath"]);
      } else {
        makeRealAuthorLink(wrongLink);
      }
    }

    function makeRealAuthorLink(wrongLink) {
      ifOpenNewTab(
        `https://wwwperf.brandeuauthorlb.ford.com/${env}${wrongLink}.html`
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

async function openPropertiesTouchUI() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];

  const newUrl = tab.url.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$2"
  );

  browser.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
}

function showAltText(tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "background",
    subject: "showAltTexts",
  });
}

function highlightHeading(tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "background",
    subject: "highlightHeading",
  });
}

function checkMothersite(tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "background",
    subject: "checkMothersite",
  });
}

async function copyAllLinks() {
  let highlightedPageLinks;

  const tabs = await browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });

  for (const element of tabs) {
    const tab = element;
    highlightedPageLinks += tab.url + "\n\n";
  }

  browser.tabs.sendMessage(tabs[0].id, {
    from: "background",
    subject: "writeToClipboard",
    text: highlightedPageLinks,
  });
}

async function executeOnEachTab(func, newTab, ...args) {
  const tabs = await browser.tabs.query({
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

browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "popup" && msg.subject === "buttonClick") {
    msg.func = this[msg.func];

    if (!msg.once) {
      executeOnEachTab(msg.func, msg.newTab, ...msg.args);
    } else {
      msg.func(...msg.args);
    }
  }
});

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "toCamelCase",
    contexts: ["selection"],
    id: "camelCase",
  });
});

const menusOnClick = function (info) {
  switch (info.menuItemId) {
    case "camelCase":
      console.log(jsConvert.toCamelCase("param-case"));
      break;
    default:
      console.log("Standard context menu item clicked.");
  }
};

browser.contextMenus.onClicked.addListener(menusOnClick);
