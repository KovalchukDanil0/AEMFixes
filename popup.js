var highlightedTabsUrls = [];
const parser = document.createElement("a");

function isMarketInBeta(market) {
  if (marketsInBeta.some((link) => market.includes(link))) return true;
  return false;
}

function ToEnvironment(env, newTab) {
  chrome.tabs.query({ highlighted: true }, function (tabs) {
    for (let index = 0; index < tabs.length; index++) {
      const tab = tabs[index];
      var url = tab.url;

      parser.href = url;
      var urlPart = parser.pathname + parser.search + parser.hash;

      var isAuthorBeta = false;
      var beta = "";
      var market, localLanguage;

      // Live
      if (url.match(regexLive)) {
        if (url.match(/www\.ford\.\w\w\.\w\w/gm)) {
          market = url.replace(regexLive, "$3");
          localLanguage = url.replace(regexLive, "$2");
        } else {
          market = url.replace(regexLive, "$2");
          localLanguage = url.replace(regexLive, "$1");
        }

        if (isMarketInBeta(market)) {
          beta = "-beta";
        }
      }
      // Perf & Prod
      else if (url.match(regexPerfProd)) {
        if (
          url.match(/www(?:perf|prod)(?:-beta)?-couk\.brandeulb\.ford\.com/gm)
        ) {
          market = url.replace(regexPerfProd, "$3");
          localLanguage = url.replace(regexPerfProd, "$2");
        } else {
          market = url.replace(regexPerfProd, "$2");
          localLanguage = url.replace(regexPerfProd, "$3");
        }

        if (isMarketInBeta(market)) beta = "-beta";
      }
      // Author
      else if (url.match(regexAuthor)) {
        market = url.replace(regexAuthor, "$2");

        localLanguage = fixLocalLanguage(
          url.replace(regexAuthor, "$3"),
          market,
          false
        );

        if (isMarketInBeta(market)) {
          beta = "-beta";

          isAuthorBeta = true;
          chrome.tabs.sendMessage(
            tab.id,
            { from: "popup", subject: "getAlias" },
            (urlPart) => {
              determineEnv(
                env,
                tab,
                market,
                localLanguage,
                beta,
                urlPart,
                newTab
              );
            }
          );
        } else {
          urlPart = urlPart.replace(
            /(?:.+)?\/content.+\/home(.+)?\.html(?:.+)?/gm,
            "$1"
          );
        }
      }

      if (!isAuthorBeta) {
        determineEnv(env, tab, market, localLanguage, beta, urlPart, newTab);
      }
    }
  });
}

function determineEnv(env, tab, market, localLanguage, beta, urlPart, newTab) {
  if (market == "") throw new Error("Market is not set!");

  //window.close();

  switch (env) {
    default:
      throw new Error("No such environment");
    case "live":
      makeLive(tab, market, localLanguage, urlPart, newTab);
      break;
    case "perf":
    case "prod":
      makePerf(env, tab, market, localLanguage, beta, urlPart, newTab);
      break;
    case "author":
      makeAuthor(tab, market, localLanguage, beta, urlPart, newTab);
      break;
  }
}

function fixMarket(market) {
  const marketsFixAuthor = ["gb"];
  const marketsFixPerf = ["uk"];

  var idx = marketsFixAuthor.indexOf(market);
  if (idx >= 0) {
    return marketsFixPerf[idx];
  }

  idx = marketsFixPerf.indexOf(market);
  if (idx >= 0) {
    return marketsFixAuthor[idx];
  }

  return market;
}

function fixLocalLanguage(localLanguage, market, toAuthor) {
  if (toAuthor) {
    if (localLanguage == "") localLanguage = market;

    switch (market) {
      case "uk":
      case "ie":
        localLanguage = "en";
        break;
      case "lu":
        localLanguage = "fr";
        break;
      case "at":
        localLanguage = "de";
        break;
      case "dk":
        localLanguage = "da";
        break;
      case "cz":
        localLanguage = "cs";
        break;
      case "gr":
        localLanguage = "el";
        break;
    }
  } else {
    switch (market) {
      case "cz":
      case "gr":
      case "lu":
      case "ie":
      case "at":
      case "dk":
        localLanguage = "";
        break;
      case "uk":
        localLanguage = "co";
        break;
    }

    if (localLanguage == market) localLanguage = "";
  }

  return localLanguage;
}

function makeLive(tab, market, localLanguage, urlPart, newTab) {
  var britain = "";
  if (market == "uk") {
    britain = market;
    market = localLanguage + ".";
    localLanguage = "";
  }

  if (localLanguage != "") localLanguage += ".";

  ifOpenNewTab(
    tab,
    "https://www." + localLanguage + "ford." + market + britain + urlPart,
    newTab
  );
}

function makePerf(env, tab, market, localLanguage, beta, urlPart, newTab) {
  if (market == "uk" || market == "gb") {
    [localLanguage, market] = [market, localLanguage];
  }

  ifOpenNewTab(
    tab,
    "https://www" +
      env +
      beta +
      "-" +
      market +
      localLanguage +
      ".brandeulb.ford.com" +
      urlPart,
    newTab
  );
}

function makeAuthor(tab, market, localLanguage, beta, urlPart, newTab) {
  var wrongLink =
    "/content/guxeu" +
    beta +
    "/" +
    market +
    "/" +
    fixLocalLanguage(localLanguage, market, true) +
    "_" +
    fixMarket(market) +
    "/home" +
    urlPart;

  var t = {
    map: {
      originalPath:
        "/content/guxeu-beta/uk/en_gb/home/vans-and-pickups/transit",
    },
  };

  chrome.storage.local
    .set({ LinkPart: parser.search + parser.hash })
    .then(() => {
      if (beta == "-beta" && urlPart != "") {
        fetch(
          "https://wwwperf.brandeuauthorlb.ford.com/bin/guxacc/tools/customslingresresolver?page-path=" +
            wrongLink,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((response) => console.log(JSON.stringify(response)));
        /*chrome.storage.local.set({ WrongLink: wrongLink }).then(() => {
          window.open(
            "https://wwwperf.brandeuauthorlb.ford.com/etc/guxacc/tools/resource-resolver-tool.html",
            "_blank"
          );
        });*/
      } else {
        makeRealAuthorLink(tab, wrongLink, newTab);
      }
    });
}

function makeRealAuthorLink(tab, wrongLink, newTab) {
  chrome.storage.local.get(["LinkPart"]).then((linkPart) => {
    ifOpenNewTab(
      tab,
      "https://wwwperf.brandeuauthorlb.ford.com/" +
        "editor.html" +
        wrongLink +
        ".html" +
        linkPart["LinkPart"],
      newTab
    );
  });
}

function ifOpenNewTab(tab, newUrl, newTab) {
  if (newTab) {
    chrome.tabs.create({ url: newUrl, index: tab.index + 1 });
  } else {
    chrome.tabs.update(tab.id, {
      url: newUrl,
    });
  }
}

function changeUI(tab, link, newTab) {
  const regexChangeUI =
    /((?:.+)?wwwperf\.brandeu(?:author)?lb\.ford\.com)((?:\/)?(?:editor\.html|cf#)?\/)(content(?:.+)?)/gm;

  var authorUI = link.replace(regexChangeUI, "$2");
  var newUrl;

  console.log(authorUI);

  if (authorUI == "/editor.html/")
    newUrl = link.replace(regexChangeUI, "$1/cf#/$3");
  else newUrl = link.replace(regexChangeUI, "$1/editor.html/$3");

  ifOpenNewTab(tab, newUrl, newTab);
}

function ButtonOnClick(selector, func, ...args) {
  var button = document.querySelector(selector);
  button.style.display = "block";
  button.addEventListener("click", function () {
    func(...args, false);
  });

  button.addEventListener("contextmenu", function () {
    func(...args, true);
  });
}

function openPropertiesTouchUI(tab) {
  var newUrl = tab.url.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$1"
  );

  chrome.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
}

(function ButtonsEvents() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;

    ifLive = url.match(regexLive);
    ifPerf = url.replace(regexPerfProd, "$1") == "perf";
    ifProd = url.replace(regexPerfProd, "$1") == "prod";
    ifPerfProd = url.match(regexPerfProd);
    ifAuthor = url.match(regexAuthor);

    if (ifLive || ifPerfProd || ifAuthor) {
      if (!ifLive) {
        ButtonOnClick("#buttonToLive", ToEnvironment, "live");
      }

      if (!ifPerf) {
        ButtonOnClick("#buttonToPerf", ToEnvironment, "perf");
      }

      if (!ifProd) {
        ButtonOnClick("#buttonToProd", ToEnvironment, "prod");
      }

      if (!ifAuthor) {
        ButtonOnClick("#buttonToAuthor", ToEnvironment, "author");
      } else {
        ButtonOnClick("#buttonToAnotherUI", changeUI, tab, url);
        ButtonOnClick(
          "#buttonOpenPropertiesTouchUI",
          openPropertiesTouchUI,
          tab
        );
      }
    }

    ifJira = url.match(regexJira);
    if (ifJira) {
      ButtonOnClick("#buttonCreateWF", function () {
        chrome.tabs.sendMessage(tab.id, { from: "popup", subject: "createWF" });
      });
      //CreateWFButton();
    }

    ButtonOnClick("#buttonShowAltTexts", function () {
      chrome.tabs.sendMessage(tab.id, {
        from: "popup",
        subject: "showAltTexts",
      });
    });

    //HighlightHeading()
  });
})();
