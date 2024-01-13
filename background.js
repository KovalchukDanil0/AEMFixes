try {
  importScripts(
    "./node_modules/webextension-polyfill/dist/browser-polyfill.js",
    "./sharedTools.js"
  );
} catch (e) {
  throw new Error(e);
}

const toEnvironment = async function (tab, url, newTab, env) {
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
          const regexFastAuthor =
            /(.+wwwperf\.brandeu(author)?)(lb\.ford\.com\/)((?:editor\.html|cf#)\/)?(content(?:.+?(html)|.+)?)/gm;

          const notContainsaAuthor =
            url.replace(regexFastAuthor, "$2") !== "author";
          const notContainsaHtml =
            url.replace(regexFastAuthor, "$6") !== "html";

          url = url.replace(
            regexFastAuthor,
            `$1${notContainsaAuthor ? "author" : ""}$3${data.env + "/"}$5${
              notContainsaHtml ? ".html" : ""
            }`
          );

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

const changeContentInTab = async function (content, urlPattern) {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    url: urlPattern,
  });

  let tab;
  const newUrl = `${urlPattern}#${content}`;
  if (tabs.length !== 0) {
    tab = tabs[0];

    browser.tabs.highlight({ tabs: tab.index });
    browser.tabs.update(tab.id, {
      url: newUrl,
    });
  } else {
    tab = await getCurrentTab();
    browser.tabs.create({ url: newUrl, index: tab.index + 1 });
  }
};

const openInTree = async function (authorUrl) {
  authorUrl = authorUrl.replace(regexAuthor, "$2");

  changeContentInTab(
    authorUrl,
    "https://wwwperf.brandeuauthorlb.ford.com/siteadmin"
  );
};

const executeOnEachTab = async function (func, newTab, ...args) {
  const tabs = await browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });
  for (const tab of tabs) {
    await func(tab, tab.url, newTab, ...args);
  }

  browser.runtime.sendMessage({
    from: "background",
    subject: "showMessage",
    message: "ALL GOOD!!!",
    time: Number.MAX_VALUE,
  });
};

browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "popup") {
    if (msg.subject === "toEnvironment") {
      if (msg.tabUrl !== "") {
        toEnvironment(msg.tab, msg.tabUrl, msg.newTab, msg.env);
      } else {
        executeOnEachTab(toEnvironment, msg.newTab, msg.env);
      }
    }

    if (msg.subject === "openInTree") {
      openInTree(msg.tab.url);
    }
  }
});

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "Open content in DAM",
    contexts: ["image"],
    id: "openInDAM",
  });

  browser.contextMenus.create({
    title: "Open content in AEM tree",
    contexts: ["link", "selection"],
    id: "openInAEM",
  });

  browser.contextMenus.create({
    title: "Open content in TouchUI",
    contexts: ["selection"],
    id: "openInTouchUI",
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

const menusOnClick = async function (info, tab) {
  switch (info.menuItemId) {
    case "openInDAM": {
      const regexImagePicker =
        /(?:.+)?(\/content\/dam\/guxeu.+?\.(?:jpeg|jpg|png))(?:\.renditions\..+)?/gm;
      const imagePath = info.srcUrl.replace(regexImagePicker, "$1");

      changeContentInTab(
        imagePath,
        "https://wwwperf.brandeuauthorlb.ford.com/damadmin"
      );

      break;
    }
    case "openInAEM": {
      let linkUrl;
      if (info.selectionText !== undefined) {
        linkUrl = `https://wwwperf.brandeuauthorlb.ford.com${info.selectionText}.html`;
      } else {
        linkUrl = info.linkUrl;
      }

      openInTree(linkUrl);

      break;
    }
    case "openInTouchUI": {
      let content = info.selectionText;
      const regexHTMLExist = /\.html(?:.+)?$/gm;
      if (!content.match(regexHTMLExist)) {
        content += ".html";
      }

      const newUrl = `https://wwwperf.brandeuauthorlb.ford.com/editor.html${content}`;
      browser.tabs.create({ url: newUrl, index: tab.index + 1 });

      break;
    }
    case "toLive":
      toEnvironment(tab, info.linkUrl, true, "live");
      break;
    case "toPerf":
      toEnvironment(tab, info.linkUrl, true, "perf");
      break;
    case "toProd":
      toEnvironment(tab, info.linkUrl, true, "prod");
      break;
    case "toTouch":
      toEnvironment(tab, info.linkUrl, true, touch);
      break;
    case "toClassic":
      toEnvironment(tab, info.linkUrl, true, classic);
      break;
    default:
      break;
  }
};

browser.contextMenus.onClicked.addListener(menusOnClick);
