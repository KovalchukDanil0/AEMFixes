import Browser from "webextension-polyfill";
import {
  GUX3,
  addBetaToLink,
  addSharedDivClasses,
  loadSavedData,
  regexAuthor,
  regexRemoveCommas,
  regexWrongPages,
  waitForElm,
} from "../SharedTools";

const url =
  window.location !== window.parent.location
    ? window.parent.location.href
    : window.location.href;

async function catErrors() {
  const savedData = await loadSavedData();
  if (!savedData.enableFunErr) {
    return;
  }

  let errorText = document.querySelector("body > header > title");
  const errorImage =
    '<img style="display: block;-webkit-user-select: none; display: block; margin-left: auto; margin-right: auto; width: 50%;" src="https://cataas.com/cat/gif">';
  const errorStyle = 'style="text-align: center; color: red; font-size: 50px;"';
  if (
    errorText != null &&
    errorText.textContent === "AEM Permissions Required"
  ) {
    document.body.innerHTML = "";
    document.body.insertAdjacentHTML(
      "afterbegin",
      errorImage + `<p ${errorStyle}>404 ERROR - Not Found</p>`,
    );
    return;
  }

  errorText = document.querySelector("body > h1");
  if (errorText != null) {
    if (errorText.textContent === "Forbidden") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + `<p ${errorStyle}>403 ERROR - Forbidden</p>`,
      );
      return;
    }
    if (errorText.textContent === "Bad Gateway") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + `<p ${errorStyle}>503 ERROR - Bad Gateway</p>`,
      );
      return;
    }
  }
}

async function ticketFinder() {
  const blockingTicketElm = await waitForElm(
    "div.workflows-warning-bar > i:nth-child(3)",
  );

  const blockingTicket: string = blockingTicketElm.textContent!;
  const blockingTicketReplaced: string = blockingTicket.replace(
    regexRemoveCommas,
    "$1",
  );

  const a: HTMLAnchorElement = document.createElement("a");
  a.style.cursor = "pointer";
  a.href = `https://jira.uhub.biz/browse/GTBEMEA${blockingTicketReplaced}#view-subtasks`;
  a.target = "_blank";
  a.textContent = blockingTicket;

  blockingTicketElm.innerHTML = "";
  blockingTicketElm.appendChild(a);
}

let refGot = false;
async function checkReferences() {
  if (refGot) {
    return;
  }

  const encodedURL = encodeURIComponent(url.replace(regexAuthor, "$2"));
  const config = `https://wwwperf.brandeuauthorlb.ford.com/bin/wcm/references?_charset_=utf-8&path=${encodedURL}&predicate=wcmcontent&exact=false`;
  const response = await fetch(config, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const refConfig = await response.json();

  const page = GUX3();
  const container = document.createElement("div");
  addSharedDivClasses(container);
  page!.insertBefore(container, page!.firstChild);

  const pageLinksArr = [];
  for (const pageRef of refConfig.pages) {
    const pagePath = pageRef.path + ".html";

    if (!regexWrongPages.test(pagePath)) {
      pageLinksArr.push(pagePath);
    }
  }

  pageLinksArr.sort((a, b) => a.localeCompare(b));
  pageLinksArr.forEach((pagePath) => {
    const pageLink = document.createElement("a");
    pageLink.href = pagePath;
    pageLink.target = "_blank";
    pageLink.textContent = pagePath;
    pageLink.classList.add("cta-secondary-chevron-right");
    addBetaToLink(pageLink);
    container.appendChild(pageLink);

    const breakLine = document.createElement("br");
    container.appendChild(breakLine);
  });

  refGot = true;
}

Browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "checkReferences") {
    checkReferences();
  }
});

(async function Main() {
  const savedData = await loadSavedData();

  if (savedData.enableFunErr) {
    catErrors();
  }

  ticketFinder();
})();
