chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Asynchronously process your "item", but DON'T return the promise
  if (msg.from === "popup" && msg.subject === "getAlias") {
    waitRealAuthorPath().then((realUrl) => {
      let urlPart = realUrl.textContent.replace(
        /(?:[\s\S]*)?Your real URL will be : \.\.\. \/home(\S+)?(?:[\s\S]*)?/gm,
        "$1"
      );
      sendResponse(urlPart);
    });

    // return true from the event listener to indicate you wish to send a response asynchronously
    // (this will keep the message channel open to the other end until sendResponse is called).
    return true;
  }
});

function waitRealAuthorPath() {
  return waitForElm("#accelerator-page > div.info-banner > div:nth-child(1)");
}

function CatErrors() {
  let errorText = document.querySelector("body > header > title");
  let errorImage =
    '<img style="display: block;-webkit-user-select: none; display: block; margin-left: auto; margin-right: auto; width: 50%;" src="https://cataas.com/cat/says/';
  if (
    errorText != null &&
    errorText.textContent == "AEM Permissions Required"
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
    if (errorText.textContent == "Forbidden") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + '403%20error - Forbidden">'
      );
      return;
    }
    if (errorText.textContent == "Bad Gateway") {
      document.body.innerHTML = "";
      document.body.insertAdjacentHTML(
        "afterbegin",
        errorImage + '503%20error - Bad Gateway">'
      );
      return;
    }
  }
}

(function () {
  let parentUrl = parent.window.location.href;
  let url = window.location.href;

  if (!url.includes(".html")) {
    url = url.replace(/.$/, ".html");

    if (
      !parentUrl.includes("editor.html") &&
      !parentUrl.includes("cf#") &&
      !parentUrl.includes("?wcmmode=disabled")
    ) {
      url = url.replace(
        /(.+wwwperf\.brandeuauthorlb\.ford\.com)?(\/)(.+)?/,
        "$1/editor.html/$3"
      );

      window.open(url, "_parent");
      return;
    }
  }

  CatErrors();
})();
