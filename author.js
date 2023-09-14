chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const item = msg.item;

  // Asynchronously process your "item", but DON'T return the promise
  asyncOperation().then(() => {
    if (msg.from === "popup" && msg.subject === "getAlias") {
      waitRealAuthorPath().then((realUrl) => {
        var urlPart = realUrl.textContent.replace(
          /(?:[\s\S]*)?Your real URL will be : \.\.\. \/home(\S+)?(?:[\s\S]*)?/gm,
          "$1"
        );
        response(urlPart);
      });
    }
  });

  // return true from the event listener to indicate you wish to send a response asynchronously
  // (this will keep the message channel open to the other end until sendResponse is called).
  return true;
});

function waitRealAuthorPath() {
  return waitForElm("#accelerator-page > div.info-banner > div:nth-child(1)");
}

function CatErrors() {
  var errorText = document.querySelector("body > header > title");
  var errorImage =
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
    return;
  }
}

(function () {
  var parentUrl = parent.window.location.href;
  var url = window.location.href;

  var openWindow = false;

  if (!url.includes(".html")) {
    url = url.replace(/.$/, ".html");

    openWindow = true;
  }

  if (
    !parentUrl.includes("editor.html") &&
    !parentUrl.includes("cf#") &&
    !parentUrl.includes("?wcmmode=disabled")
  ) {
    url = url.replace(
      /(.+wwwperf\.brandeuauthorlb\.ford\.com)?(\/)(.+)?/,
      "$1/editor.html/$3"
    );

    openWindow = true;
  }

  if (openWindow) {
    window.open(url, "_parent");
    return;
  }

  CatErrors();
})();
