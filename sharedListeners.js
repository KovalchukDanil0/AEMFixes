browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.from !== "background") {
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
      console.log(elm);

      sendResponse(elm.content);
    })();

    return true;
  }

  if (msg.subject === "writeToClipboard") {
    copyTextToClipboard(msg.text);

    if (msg.showMessage) {
      browser.runtime.sendMessage({
        from: "context",
        subject: "showMessage",
        message: `LINKS COPIED TO CLIPBOARD:\n ${msg.text}`,
        time: 5000,
      });
    }
  }
});
