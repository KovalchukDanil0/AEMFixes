const regexRemoveSpaces = /^\s+|\s+$|\s+(?=\s)/gm;

const buttonsContainer = function () {
  return document.querySelector(
    "#stalker > div > div.command-bar > div > div > div > div.aui-toolbar2-primary"
  );
};

window.createWFButton = function () {
  const button = document.querySelector("#assign-issue").cloneNode(true);

  button.removeAttribute("id");
  button.removeAttribute("href");

  button.title = "Create WF";
  button.className = "aui-button";

  button.textContent = "Create WF";

  return button;
};

window.selectorTextNoSpaces = function (selector) {
  return document
    .querySelector(selector)
    .textContent.replace(regexRemoveSpaces, "");
};

window.ticketMarket = function () {
  return selectorTextNoSpaces("#customfield_13300-val");
};

window.ticketLocalLanguage = function () {
  return selectorTextNoSpaces("#customfield_15000-val");
};

window.ticketTitle = function () {
  return selectorTextNoSpaces("#summary-val");
};

window.ticketNumber = function () {
  return document
    .querySelector("#parent_issue_summary")
    .getAttribute("data-issue-key")
    .match(/ESM-\w+/gm);
};

window.textToWFPath = function (market, localLanguage, title) {
  let fullPath;

  const WFPathFromTitle = function () {
    const regexWFTitle = /^(?:NWP_)?(\w\w)(\w\w)?(?:.+)?/gm;

    market = title.replace(regexWFTitle, "$1");
    localLanguage = title.replace(regexWFTitle, "$2");

    if (localLanguage === "") {
      fullPath = market + market;
    } else {
      fullPath = `${market}/${market}${localLanguage}`;
    }
  };

  const belgium = function () {
    switch (localLanguage) {
      case "Dutch":
        fullPath += `/${fullPath}NL`;
        break;
      case "French":
        fullPath += `/${fullPath}FR`;
        break;
      default:
        WFPathFromTitle();
        break;
    }
  };

  const switzerland = function () {
    switch (localLanguage) {
      case "German":
        fullPath += `/${fullPath}DE`;
        break;
      case "French":
        fullPath += `/${fullPath}FR`;
        break;
      case "Italian":
        fullPath += `/${fullPath}IT`;
        break;
      default:
        WFPathFromTitle();
        break;
    }
  };

  switch (market) {
    case "Ford of Germany":
      fullPath = "DEDE";
      break;
    case "Ford of Britain":
      fullPath = "ENGB";
      break;
    case "Ford of Spain":
      fullPath = "ESES";
      break;
    case "Ford of France":
      fullPath = "FRFR";
      break;
    case "Ford of Italy":
      fullPath = "ITIT";
      break;
    case "Ford of Netherlands":
      fullPath = "NLNL";
      break;
    case "Ford of Ireland":
      fullPath = "IEIE";
      break;
    case "Ford of Denmark":
      fullPath = "DA_DK";
      break;
    case "Ford of Portugal":
      fullPath = "PTPT";
      break;
    case "Ford of Norway":
      fullPath = "NONO";
      break;
    case "Ford of Finland":
      fullPath = "FIFI";
      break;
    case "Ford of Poland":
      fullPath = "PLPL";
      break;
    case "Ford of Austria":
      fullPath = "ATDE";
      break;
    case "Ford of Czech Republic":
      fullPath = "CSCZ";
      break;
    case "Ford of Belgium":
      fullPath = "BE";
      belgium();
      break;
    case "Ford of Hungary":
      fullPath = "HUHU";
      break;
    case "Ford of Greece":
      fullPath = "ELGR";
      break;
    case "Ford of Switzerland":
      fullPath = "CH";
      switzerland();
      break;
    case "Ford of Romania":
      fullPath = "RORO";
      break;
    case "Ford of Luxembourg":
      fullPath = "LULU";
      break;
    default:
      WFPathFromTitle();
      break;
    // FOE
    // FMNY
    // FMNYDE
    // MS
  }

  return fullPath;
};

window.AEMToolsCreateWF = function () {
  const title = ticketTitle();

  browser.storage.local
    .set({ WFTitle: title, WFName: ticketNumber() })
    .then(() => {
      const WFPath = textToWFPath(ticketMarket(), ticketLocalLanguage(), title);

      window.open(
        "https://wwwperf.brandeuauthorlb.ford.com/miscadmin#/etc/workflow/packages/ESM/" +
          WFPath
      );
    });
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "createWF") {
    AEMToolsCreateWF();
  }
});

window.FixSorting = function () {
  const sortByDate = document.querySelector(
    '#attachment-sorting-options > li:nth-child(2) > a:not([class*="aui-checked"])'
  );
  if (sortByDate != null) {
    sortByDate.click();
  }

  const descending = document.querySelector(
    '#attachment-sorting-order-options > li:nth-child(2) > a:not([class*="aui-checked"])'
  );
  if (descending != null) {
    descending.click();
  }
};

(async function Jira() {
  const savedData = await loadSavedData();

  if (!savedData.disableCreateWF) {
    const WFButton = buttonsContainer().appendChild(createWFButton());
    WFButton.addEventListener("click", AEMToolsCreateWF);
  }

  FixSorting();
})();
