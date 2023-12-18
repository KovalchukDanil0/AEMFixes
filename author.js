const url =
  window.location !== window.parent.location
    ? window.parent.location.href
    : window.location.href;

window.catErrors = async function () {
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
      errorImage + `<p ${errorStyle}>404 ERROR - Not Found</p>`
    );
    return;
  }

  errorText = document.querySelector("body > h1");
  if (errorText != null) {
    if (errorText.textContent === "Forbidden") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + `<p ${errorStyle}>403 ERROR - Forbidden</p>`
      );
      return;
    }
    if (errorText.textContent === "Bad Gateway") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + `<p ${errorStyle}>503 ERROR - Bad Gateway</p>`
      );
      return;
    }
  }
};

// ! NOT WORKING
window.fixAuthorLink = function () {
  let newUrl;

  if (!url.includes(".html")) {
    newUrl = url.replace(/.$/, ".html");

    if (
      !url.includes(touch) &&
      !url.includes(classic) &&
      !url.includes("?wcmmode=disabled") &&
      !url.includes("damadmin#")
    ) {
      newUrl = url.replace(
        /(.+wwwperf\.brandeuauthorlb\.ford\.com)?(\/)(.+)?/,
        `$1/${touch}/$3`
      );

      window.open(newUrl, "_parent");
      return;
    }
  }
};

// #issuetable > tbody > tr> td.stsequence > div.subtask-done
window.ticketFinder = async function () {
  const data = new AEMLink("", url);
  console.log(data);

  const warningBar = await waitForElm("div.workflows-warning-bar");

  const regexRemoveCommas = /.+(ESM-\d\d\d\d\d\d?).+/gm;
  const blockingTicket = warningBar
    .querySelector("i:nth-child(3)")
    .textContent.replace(regexRemoveCommas, "$1");

  const a = document.createElement("a");
  a.style.cursor = "pointer";

  const fullPath = `https://jira.uhub.biz/browse/GTBEMEA${blockingTicket}#view-subtasks`;

  const linkText = document.createTextNode(
    `blocking parent ticket is ${fullPath}`
  );
  a.appendChild(linkText);

  a.addEventListener("click", async function () {
    await browser.storage.local.set({ SearchSubTask: data.market });
    window.open(fullPath, "_blank");
  });

  warningBar.appendChild(a);
};

let refGot = false;
window.checkReferences = async function () {
  if (refGot) {
    return;
  }

  const encodedURL = encodeURIComponent(url.replace(regexAuthor, "$2"));
  const config = `https://wwwperf.brandeuauthorlb.ford.com/bin/wcm/references?_charset_=utf-8&path=${encodedURL}&predicate=wcmcontent&exact=false`;
  console.log(config);
  const response = await fetch(config, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const refConfig = await response.json();

  const page = GUX3();
  const container = document.createElement("div");
  container.addSharedDivClasses();
  page.insertBefore(container, page.firstChild);

  const pageLinksArr = [];
  for (const pageRef of refConfig.pages) {
    const pagePath = pageRef.path + ".html";

    const regexWrongPages =
      /content\/(?:launches|guxeu(?:-beta)?\/(?:training-tree|\w\w)\/\w\w_\w\w\/home\/(?:sandbox)?)/gm;
    if (!pagePath.match(regexWrongPages)) {
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
    pageLink.addBetaToLink();
    container.appendChild(pageLink);

    const breakLine = document.createElement("br");
    container.appendChild(breakLine);
  });

  refGot = true;
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "checkReferences") {
    checkReferences();
  }
});

(async function Main() {
  const savedData = await loadSavedData();

  if (savedData.enableFunErr) {
    catErrors();
  }

  //fixAuthorLink();
  ticketFinder();
})();
