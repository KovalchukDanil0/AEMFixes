const regexRemoveSpaces = /^\s+|\s+$|\s+(?=\s)/gm;

let buttonsContainer = function () {
  return document.querySelector(
    "#stalker > div > div.command-bar > div > div > div > div.aui-toolbar2-primary"
  );
};

function createWFButton() {
  let button = document.querySelector("#assign-issue").cloneNode(true);

  button.removeAttribute("id");
  button.removeAttribute("href");

  button.title = "Create WF";
  button.className = "aui-button";

  button.textContent = "Create WF";

  return button;
}

function selectorTextNoSpaces(selector) {
  return document
    .querySelector(selector)
    .textContent.replace(regexRemoveSpaces, "");
}

function ticketMarket() {
  return selectorTextNoSpaces("#customfield_13300-val");
}

function ticketLocalLanguage() {
  return selectorTextNoSpaces("#customfield_15000-val");
}

function ticketTitle() {
  return selectorTextNoSpaces("#summary-val");
}

function ticketNumber() {
  return document
    .querySelector("#parent_issue_summary")
    .getAttribute("data-issue-key")
    .match(/ESM-\w+/gm);
}

function textToWFPath(market, localLanguage, title) {
  let fullPath;
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
      switch (localLanguage) {
        case "Dutch":
          fullPath += "/" + fullPath + "NL";
          break;
        case "French":
          fullPath += "/" + fullPath + "FR";
          break;
        default:
          fullPath = WFPathFromTitle(title);
          break;
      }
      break;
    case "Ford of Hungary":
      fullPath = "HUHU";
      break;
    case "Ford of Greece":
      fullPath = "ELGR";
      break;
    case "Ford of Switzerland":
      fullPath = "CH";
      switch (localLanguage) {
        case "German":
          fullPath += "/" + fullPath + "DE";
          break;
        case "French":
          fullPath += "/" + fullPath + "FR";
          break;
        case "Italian":
          fullPath += "/" + fullPath + "IT";
          break;
        default:
          fullPath = WFPathFromTitle(title);
          break;
      }
      break;
    case "Ford of Romania":
      fullPath = "RORO";
      break;
    case "Ford of Luxembourg":
      fullPath = "LULU";
      break;
    default:
      fullPath = WFPathFromTitle(title);
      break;
    // FOE
    // FMNY
    // FMNYDE
    // MS
  }

  return fullPath;
}

function WFPathFromTitle(title) {
  const regexWFTitle = /^(?:NWP_)?(\w\w)(\w\w)?(?:.+)?/gm;

  let market = title.replace(regexWFTitle, "$1");
  let localLanguage = title.replace(regexWFTitle, "$2");

  if (localLanguage == "") {
    return market + market;
  } else {
    return market + "/" + market + localLanguage;
  }
}

function AEMToolsCreateWF() {
  let title = ticketTitle();

  browser.storage.local.set({ WFTitle: title }).then(() => {
    browser.storage.local.set({ WFName: ticketNumber() }).then(() => {
      let WFPath = textToWFPath(ticketMarket(), ticketLocalLanguage(), title);

      window.open(
        "https://wwwperf.brandeuauthorlb.ford.com/miscadmin#/etc/workflow/packages/ESM/" +
          WFPath
      );
    });
  });
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "popup" && msg.subject === "createWF") {
    AEMToolsCreateWF();
  }
});

function FixSorting() {
  let sortByDate = document.querySelector(
    '#attachment-sorting-options > li:nth-child(2) > a:not([class*="aui-checked"])'
  );
  if (sortByDate != null) {
    sortByDate.click();
  }

  let descending = document.querySelector(
    '#attachment-sorting-order-options > li:nth-child(2) > a:not([class*="aui-checked"])'
  );
  if (descending != null) {
    descending.click();
  }
}

(function Jira() {
  let WFButton = buttonsContainer().appendChild(createWFButton());
  WFButton.addEventListener("click", AEMToolsCreateWF);

  FixSorting();
})();
