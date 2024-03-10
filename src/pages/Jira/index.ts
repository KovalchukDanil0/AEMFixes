import Browser from "webextension-polyfill";
import { loadSavedData, regexWFTitle } from "../../shared";

function createWFButton() {
  const buttonsContainer = document.querySelector(
    "#stalker > div > div.command-bar > div > div > div > div.aui-toolbar2-primary",
  ) as HTMLDivElement;

  const butCreateWF: HTMLAnchorElement = document
    .querySelector("#assign-issue")!
    .cloneNode(true) as HTMLAnchorElement;

  butCreateWF.removeAttribute("id");
  butCreateWF.href = AEMToolsCreateWF();
  butCreateWF.target = "_blank";

  butCreateWF.title = "Create WF";
  butCreateWF.textContent = "Create WF";

  butCreateWF.className = "aui-button";

  buttonsContainer.appendChild(butCreateWF);
}

const selectorTextNoSpaces = (selector: string): string =>
  document.querySelector(selector)!.textContent!.trim();

function textToWFPath(
  market: string,
  localLanguage: string,
  title: string,
): string {
  let fullPath = "";

  function belgium() {
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
  }

  function switzerland() {
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
  }

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
    // eslint-disable-next-line no-restricted-globals
    const response = confirm(
      "Market was not determined, can we take path from title?",
    );
    if (!response) {
      return;
    }

    market = title.replace(regexWFTitle, "$1");
    localLanguage = title.replace(regexWFTitle, "$2");

    if (localLanguage === "") {
      fullPath = market + market;
    } else {
      fullPath = `${market}/${market}${localLanguage}`;
    }
  }

  return fullPath;
}

function AEMToolsCreateWF(): string {
  const ticketNumElm: HTMLElement = document.querySelector(
    "#parent_issue_summary",
  ) as HTMLElement;
  if (ticketNumElm == null) {
    throw new Error("This is not children ticket page");
  }

  function ticketNumber(): string {
    const ticketNum: string = ticketNumElm
      .getAttribute("data-issue-key")!
      .match(/ESM-\w+/gm)?.[0]!;

    let embargo = "";

    const labels: NodeListOf<HTMLSpanElement> = document.querySelectorAll(
      "#wrap-labels > div > ul > li > a > span",
    );
    labels.forEach((label: HTMLSpanElement) => {
      if (label.textContent!.includes("embargo")) {
        embargo = "-EMBARGO";
      }
    });

    let fix = "";
    const ticketStatus: string = (
      document.querySelector("#status-val > span") as HTMLSpanElement
    ).textContent!;
    if (ticketStatus.includes("deployment")) {
      fix = "-FIX";
    }

    return ticketNum + embargo + fix;
  }

  const ticketMarket: string = selectorTextNoSpaces("#customfield_13300-val");
  const ticketLocalLanguage: string = selectorTextNoSpaces(
    "#customfield_15000-val",
  );
  const ticketTitle: string = selectorTextNoSpaces("#summary-val");

  Browser.storage.local.set({ WFTitle: ticketTitle, WFName: ticketNumber() });

  const WFPath: string = textToWFPath(
    ticketMarket,
    ticketLocalLanguage,
    ticketTitle,
  );

  return (
    "https://wwwperf.brandeuauthorlb.ford.com/miscadmin#/etc/workflow/packages/ESM/" +
    WFPath
  );
}

function FixSorting() {
  const sortByDate: HTMLAnchorElement = document.querySelector(
    '#attachment-sorting-options > li:nth-child(2) > a:not([class*="aui-checked"])',
  )!;
  if (sortByDate != null) {
    sortByDate.click();
  }

  const descending: HTMLAnchorElement = document.querySelector(
    '#attachment-sorting-order-options > li:nth-child(2) > a:not([class*="aui-checked"])',
  )!;
  if (descending != null) {
    descending.click();
  }
}

Browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "createWF") {
    window.open(AEMToolsCreateWF());
  }
});

(async function Main() {
  const savedData = await loadSavedData();

  if (!savedData.disCreateWF) {
    createWFButton();
  }

  if (savedData.enableFiltreFix) {
    FixSorting();
  }
})();
