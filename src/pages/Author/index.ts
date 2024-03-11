import { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import Browser from "webextension-polyfill";
import ReferencesBanner from "../../containers/ReferencesBanner";
import WFShowTicket from "../../containers/WFShowTicket";
import {
  GUX3,
  MessageCommon,
  ReferencesConfig,
  loadSavedData,
  regexAuthor,
  waitForElm,
} from "../../shared";

const url =
  window.location !== window.parent.location
    ? window.parent.location.href
    : window.location.href;

function getRealPerfUrl(): string {
  return document.querySelector<HTMLMetaElement>("head > meta[name='og:url']")
    ?.content!;
}

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
  const blockingTicketElm: HTMLElement = await waitForElm(
    "div.workflows-warning-bar > i:nth-child(3)",
  );
  const root = createRoot(blockingTicketElm);

  const blockingTicket: string = blockingTicketElm.textContent!;
  const wfShowTicket: ReactElement = WFShowTicket({ blockingTicket });
  root.render(wfShowTicket);
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
  const refConfig: ReferencesConfig = await response.json();

  const page = GUX3();
  const container = page.insertBefore(
    document.createElement("div"),
    page.firstChild,
  );
  const root = createRoot(container);

  const referencesBanner: ReactElement = ReferencesBanner({
    pages: refConfig.pages,
  });
  root.render(referencesBanner);

  refGot = true;
}

Browser.runtime.onMessage.addListener(
  (msg: MessageCommon, _sender, _sendResponse) => {
    if (msg.from === "popup" && msg.subject === "checkReferences") {
      checkReferences();
    }

    if (msg.from === "background" && msg.subject === "getRealUrl") {
      return Promise.resolve(getRealPerfUrl());
    }
  },
);

(async function Main() {
  const savedData = await loadSavedData();

  if (savedData.enableFunErr) {
    catErrors();
  }

  ticketFinder();
})();
