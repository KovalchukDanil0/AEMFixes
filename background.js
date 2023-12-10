try {
  importScripts(
    "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
    "./sharedTools.js"
  );
} catch (e) {
  throw new Error(e);
}

const toEnvironment = async function (tab, url, env, newTab) {
  const data = new AEMLink(env, url);
  await data.getAuthorRealUrl(tab);

  return new Promise((resolve, reject) => {
    (async function Main() {
      browser.runtime.sendMessage({
        from: "background",
        subject: "showMessage",
        message: "PLEASE WAIT",
        time: Number.MAX_VALUE,
      });

      determineEnv();
    })();

    function determineEnv() {
      if (data.market === "") {
        if (data.fastAuthor) {
          const regexFastAuthor = /com\/(?:(editor\.html|cf#)\/)?content/gm;
          url = url.replace(regexFastAuthor, `com/${data.env}/content`);

          ifOpenNewTab(url);
          return;
        } else {
          reject(new Error("Market is not set!"));
        }
      }

      switch (data.env) {
        case "live":
          makeLive();
          break;
        case "perf":
        case "prod":
          makePerf();
          break;
        case touch:
        case classic:
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

      const regexFixSiteWide =
        /((?:\S+)?\/content\/guxeu(?:-beta)?\/\w\w\/\w\w_\w\w)(\/home\/)(content)?(\S+)?/gm;
      if (wrongLink.replace(regexFixSiteWide, "$3") === "content") {
        wrongLink = wrongLink.replace(
          regexFixSiteWide,
          "$1/site-wide-content$4"
        );
      }

      if (data.beta === "-beta" && data.urlPart !== "") {
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
};

const openPropertiesTouchUI = async function () {
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
};

const copyAllLinks = async function () {
  let highlightedPageLinks = "";

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
    showMessage: true,
  });
};

const changeContentInTab = async function (regexToMatch, urlPart, content) {
  let tabs = await browser.tabs.query({ currentWindow: true });

  const newUrl = urlPart + content;

  let foundExisting = false;
  tabs.forEach((tab) => {
    if (tab.url.match(regexToMatch)) {
      browser.tabs.highlight({ tabs: tab.index });

      browser.tabs.update(tab.id, {
        url: newUrl,
      });

      foundExisting = true;
      return;
    }
  });

  if (!foundExisting) {
    tabs = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });
    const tab = tabs[0];

    browser.tabs.create({ url: newUrl, index: tab.index + 1 });
  }
};

const openInTree = function (authorTab) {
  const authorUrl = authorTab.url.replace(regexAuthor, "$2");
  changeContentInTab(
    regexAEMTree,
    "https://wwwperf.brandeuauthorlb.ford.com/siteadmin#",
    authorUrl
  );
};

const executeOnEachTab = async function (func, newTab, ...args) {
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
};

let vehicleConfig = null;
(async function getHAR() {
  /* Keep track of the active tab in each window */
  const activeTabs = {};

  browser.tabs.onActivated.addListener(function (details) {
    activeTabs[details.windowId] = details.tabId;
  });

  /* Clear the corresponding entry, whenever a window is closed */
  browser.windows.onRemoved.addListener(function (winId) {
    delete activeTabs[winId];
  });

  /* Listen for web-requests and filter them */
  browser.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (details.tabId === -1) {
        // Skipping request from non-tabbed context...
        return;
      }

      const notInteresting = Object.keys(activeTabs).every(function (key) {
        if (activeTabs[key] === details.tabId) {
          /* We are interested in this request */
          const url = details.url;

          const regexVehicleCode = /(?:SL1|KMI|TDR)\?locale=\w\w_\w\w/gm;
          if (url.match(regexVehicleCode)) {
            vehicleConfig = url;
          }

          return false;
        } else {
          return true;
        }
      });

      if (notInteresting) {
        /* We are not interested in this request */
        // Just ignore this one
      }
    },
    { urls: ["<all_urls>"] }
  );

  /* Get the active tabs in all currently open windows */
  const activeTab = await browser.tabs.query({
    active: true,
  });

  activeTab.forEach(function (tab) {
    activeTabs[tab.windowId] = tab.id;
  });
})();

browser.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
  if (msg.from === "popup" && msg.subject === "buttonClick") {
    switch (msg.func) {
      case "toEnvironment":
        msg.func = toEnvironment;
        break;
      case "openPropertiesTouchUI":
        msg.func = openPropertiesTouchUI;
        break;
      case "highlightHeading":
        msg.func = highlightHeading;
        break;
      case "copyAllLinks":
        msg.func = copyAllLinks;
        break;
      case "openInTree":
        msg.func = openInTree;
        break;
      default:
        throw new Error(`${msg.func} function doesn't exist`);
    }

    if (!msg.once) {
      executeOnEachTab(msg.func, msg.newTab, ...msg.args);
    } else {
      msg.func(...msg.args);
    }
  }

  if (msg.from === "context" && msg.subject === "getHAR") {
    const intervalID = setInterval(function () {
      if (vehicleConfig === null) {
        return;
      }

      sendResponse(vehicleConfig);
      clearInterval(intervalID);
    }, 1000);

    return true;
  }
});

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "Open content in DAM",
    contexts: ["image"],
    id: "openInDAM",
  });

  const parent = browser.contextMenus.create({
    title: "To Environment",
    contexts: ["link"],
    id: "toEnvironment",
  });

  browser.contextMenus.create({
    title: "To Live",
    contexts: ["link"],
    parentId: parent,
    id: "toLive",
  });

  browser.contextMenus.create({
    title: "To Perf",
    contexts: ["link"],
    parentId: parent,
    id: "toPerf",
  });

  browser.contextMenus.create({
    title: "To Prod",
    contexts: ["link"],
    parentId: parent,
    id: "toProd",
  });

  browser.contextMenus.create({
    title: "To Touch",
    contexts: ["link"],
    parentId: parent,
    id: "toTouch",
  });

  browser.contextMenus.create({
    title: "To Classic",
    contexts: ["link"],
    parentId: parent,
    id: "toClassic",
  });
});

const menusOnClick = async function (info) {
  const tab = await getCurrentTab();

  switch (info.menuItemId) {
    case "openInDAM": {
      const regexImagePicker =
        /(?:.+)?(\/content\/dam\/guxeu.+?\.(?:jpeg|jpg|png))(?:\.renditions\..+)?/gm;
      const imagePath = info.srcUrl.replace(regexImagePicker, "$1");

      changeContentInTab(
        regexDAMTree,
        "https://wwwperf.brandeuauthorlb.ford.com/damadmin#",
        imagePath
      );

      break;
    }
    case "toLive":
      toEnvironment(tab, info.linkUrl, "live", true);
      break;
    case "toPerf":
      toEnvironment(tab, info.linkUrl, "perf", true);
      break;
    case "toProd":
      toEnvironment(tab, info.linkUrl, "prod", true);
      break;
    case "toTouch":
      toEnvironment(tab, info.linkUrl, touch, true);
      break;
    case "toClassic":
      toEnvironment(tab, info.linkUrl, classic, true);
      break;
    default:
      break;
  }
};

browser.contextMenus.onClicked.addListener(menusOnClick);
