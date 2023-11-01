browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from === "popup" && msg.subject === "getAlias") {
    (async () => {
      let realUrl = await waitForElm(
        "#accelerator-page > div.info-banner > div:nth-child(1)"
      );
      realUrl = realUrl.textContent.replace(
        /(?:[\s\S]*)?Your real URL will be : \.\.\. (\S+)?(?:[\s\S]*)?/gm,
        "$1"
      );
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
    '<img style="display: block;-webkit-user-select: none; display: block; margin-left: auto; margin-right: auto; width: 50%;" src="https://cataas.com/cat/says/';
  if (
    errorText != null &&
    errorText.textContent === "AEM Permissions Required"
  ) {
    document.body.innerHTML = "";
    document.body.insertAdjacentHTML(
      "afterbegin",
      errorImage + '404%20error - Not Found">'
    );
    return;
  }

  errorText = document.querySelector("body > h1");
  if (errorText != null) {
    if (errorText.textContent === "Forbidden") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + '403%20error - Forbidden">'
      );
      return;
    }
    if (errorText.textContent === "Bad Gateway") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + '503%20error - Bad Gateway">'
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
