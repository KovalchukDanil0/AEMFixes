const url =
  window.location !== window.parent.location
    ? window.parent.location.href + window.parent.location.hash
    : window.location.href;

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from === "background" && msg.subject === "getAlias") {
    (async () => {
      const urlPart =
        /(?:[\s\S]*)?Your real URL will be : \.\.\. \/(home|site-wide-content)(\S+)?(?:[\s\S]*)/gm;

      let realUrl = await waitForElm(
        "#accelerator-page > div.info-banner > div:nth-child(1)"
      );

      let content = "";
      if (realUrl.textContent.replace(urlPart, "$1") === "site-wide-content") {
        content = "/content";
      }
      realUrl = realUrl.textContent.replace(urlPart, content + "$2");

      sendResponse(realUrl);
    })();

    // Important! Return true to indicate you want to send a response asynchronously
    return true;
  }

  return false;
});

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
  const data = new AEMLink(classic, url);

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

(async function Main() {
  const savedData = await loadSavedData();

  if (savedData.enableFunErr) {
    catErrors();
  }

  //fixAuthorLink();
  ticketFinder();
})();
