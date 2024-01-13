const copyTextToClipboard = function (text) {
  const copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);

  copyFrom.select();
  document.execCommand("copy");

  copyFrom.blur();
  document.body.removeChild(copyFrom);
};

browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from === "context") {
    return;
  }

  if (msg.subject === "getRealUrl") {
    let doc = document;
    if (msg.html !== null) {
      const parser = new DOMParser();
      doc = parser.parseFromString(msg.html, "text/html");
    }

    (async () => {
      const elm = await waitForElm('head > meta[name="og:url"]', doc);

      sendResponse(elm.content);
    })();

    return true;
  }

  if (msg.subject === "writeToClipboard") {
    copyTextToClipboard(msg.text);

    return false;
  }

  return false;
});

/* (async function Main() {
  const metaTitle = await waitForElm('head > meta[name="og:title"]');

  const metaDescription = document.querySelector(
    'head > meta[name="og:description"]'
  );
})();
 */
