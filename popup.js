let statusBar;
window.showMessage = function (message, time) {
  if (statusBar == null) {
    statusBar = document.getElementById("statusBar");
  }

  statusBar.textContent = message;
  statusBar.style.display = "inherit";
  if (time !== Number.MAX_VALUE) {
    setTimeout(() => {
      statusBar.style.display = "none";
    }, time);
  }
};

window.buttonOnClick = function (selector, func, showLoading, once, ...args) {
  const button = document.querySelector(selector);
  button.disabled = false;

  button.addEventListener("click", async function () {
    if (showLoading) {
      button.classList.add("is-loading");
    }

    await browser.runtime.sendMessage({
      once,
      func,
      args,
      from: "popup",
      subject: "buttonClick",
      newTab: false,
    });
  });
  button.addEventListener("auxclick", async function (e) {
    if (e.button !== 1) {
      return;
    }

    if (showLoading) {
      button.classList.add("is-loading");
    }

    await browser.runtime.sendMessage({
      once,
      func,
      args,
      from: "popup",
      subject: "buttonClick",
      newTab: true,
    });
  });
};

browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "background" && msg.subject === "showMessage") {
    showMessage(msg.message, msg.time);
  }
});

(async function ButtonsEvents() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  const tab = tabs[0];

  buttonOnClick("#buttonShowAltTexts", "showAltText", false, true, tab);

  buttonOnClick("#buttonCopyAllLinks", "copyAllLinks", false, true);

  //HighlightHeading()

  const ifJira = tab.url.match(regexJira);
  if (ifJira) {
    buttonOnClick(
      "#buttonCreateWF",
      function () {
        browser.tabs.sendMessage(tab.id, {
          from: "popup",
          subject: "createWF",
        });
      },
      false,
      false
    );
    return;
  }

  /*let ifLive = url.match(regexLive);
  let ifPerf = url.replace(regexPerfProd, "$1") == "perf";
  let ifProd = url.replace(regexPerfProd, "$1") == "prod";
  let ifPerfProd = url.match(regexPerfProd);*/

  const ifAuthor = tab.url.match(regexAuthor);

  buttonOnClick("#buttonToLive", "toEnvironment", true, false, "live");
  buttonOnClick("#buttonToPerf", "toEnvironment", true, false, "perf");
  buttonOnClick("#buttonToProd", "toEnvironment", true, false, "prod");
  buttonOnClick("#buttonToClassic", "toEnvironment", true, false, "cf#");
  buttonOnClick("#buttonToTouch", "toEnvironment", true, false, "editor.html");

  if (ifAuthor) {
    buttonOnClick(
      "#buttonOpenPropertiesTouchUI",
      "openPropertiesTouchUI",
      false,
      true
    );
  }
})();
