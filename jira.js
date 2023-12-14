const regexWFTitle = /^(?:NWP_)?(\w\w)(\w\w)?(?:.+)?/gm;

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

  buttonsContainer().appendChild(button);
  button.addEventListener("click", AEMToolsCreateWF);
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

window.marketFromTitle = function (title) {
  return title.replace(regexWFTitle, "$1");
};

window.textToWFPath = function (market, localLanguage, title) {
  let fullPath;

  const belgium = function () {
    switch (localLanguage) {
      case "Dutch":
        fullPath += `/${fullPath}NL`;
        break;
      case "French":
        fullPath += `/${fullPath}FR`;
        break;
      default:
        wfPathFromTitle();
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
        wfPathFromTitle();
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
      wfPathFromTitle();
      break;
    // FOE
    // FMNY
    // FMNYDE
    // MS
  }

  function wfPathFromTitle() {
    market = marketFromTitle();
    localLanguage = title.replace(regexWFTitle, "$2");

    if (localLanguage === "") {
      fullPath = market + market;
    } else {
      fullPath = `${market}/${market}${localLanguage}`;
    }
  }

  return fullPath;
};

window.AEMToolsCreateWF = async function () {
  const title = ticketTitle();

  await browser.storage.local.set({ WFTitle: title, WFName: ticketNumber() });

  const WFPath = textToWFPath(ticketMarket(), ticketLocalLanguage(), title);

  window.open(
    "https://wwwperf.brandeuauthorlb.ford.com/miscadmin#/etc/workflow/packages/ESM/" +
      WFPath
  );
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

window.openSubTask = async function () {
  const ticketMarketToFound = await browser.storage.local.get({
    SearchSubTask: "",
  });

  if (ticketMarketToFound["SearchSubTask"] === "") {
    return;
  }

  const allSubTasks = document.querySelectorAll(
    "#view-subtasks > div.mod-content > div > issuetable-web-component > table > tbody > tr > td.stsummary > a"
  );

  let linkToOpen = null;
  if (allSubTasks.length === 1) {
    linkToOpen = allSubTasks[0].href;
  } else {
    allSubTasks.forEach((subTask) => {
      const title = subTask.textContent;
      const market = marketFromTitle(title);

      if (ticketMarketToFound === market.toLowerCase()) {
        linkToOpen = subTask.href;
      }
    });
  }

  if (linkToOpen !== null) {
    await browser.storage.local.set({ SearchSubTask: "" });
    window.open(linkToOpen, "_self");
  }
};

(async function Main() {
  const savedData = await loadSavedData();

  if (!savedData.disCreateWF) {
    createWFButton();
  }

  if (savedData.enableFiltreFix) {
    FixSorting();
  }

  openSubTask();
})();
