browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from === "popup" && msg.subject === "getAlias") {
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

window.catErrors = function () {
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

window.fixAuthorLink = function () {
  const parentUrl = parent.window.location.href;
  let url = window.location.href;

  if (!url.includes(".html")) {
    url = url.replace(/.$/, ".html");

    if (
      !parentUrl.includes("editor.html") &&
      !parentUrl.includes("cf#") &&
      !parentUrl.includes("?wcmmode=disabled") &&
      !parentUrl.includes("damadmin#")
    ) {
      url = url.replace(
        /(.+wwwperf\.brandeuauthorlb\.ford\.com)?(\/)(.+)?/,
        "$1/editor.html/$3"
      );

      window.open(url, "_parent");
      return;
    }
  }
};

(async function () {
  const savedData = await loadSavedData();
  if (savedData.enableFunErr) {
    catErrors();
  }

  fixAuthorLink();
})();
