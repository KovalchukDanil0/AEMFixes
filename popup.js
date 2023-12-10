let statusBar;
window.showMessage = function (message, time) {
  if (statusBar == null) {
    statusBar = document.getElementById("statusBar");
  }

  statusBar.textContent = message;
  statusBar.style.display = "inherit";
  statusBar.classList.add("message-body");

  if (time !== Number.MAX_VALUE) {
    setTimeout(() => {
      statusBar.style.display = "none";
      statusBar.className = "";
    }, time);
  }
};

window.buttonOnClick = function (selector, func, showLoading, once, ...args) {
  const button = document.querySelector(selector);
  button.disabled = false;

  button.addEventListener("click", function () {
    if (showLoading) {
      button.classList.add("is-loading");
    }

    if (typeof func === "function") {
      func(...args);
    } else {
      browser.runtime.sendMessage({
        once,
        func,
        args,
        from: "popup",
        subject: "buttonClick",
        newTab: false,
      });
    }
  });
  button.addEventListener("auxclick", function (e) {
    if (e.button !== 1) {
      return;
    }

    if (showLoading) {
      button.classList.add("is-loading");
    }

    if (typeof func === "function") {
      func(...args);
    } else {
      browser.runtime.sendMessage({
        once,
        func,
        args,
        from: "popup",
        subject: "buttonClick",
        newTab: true,
      });
    }
  });
};

window.createWF = function (tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "popup",
    subject: "createWF",
  });
};

window.checkMothersite = function (tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "popup",
    subject: "checkMothersite",
  });
};

window.showAltText = function (tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "popup",
    subject: "showAltTexts",
  });
};

window.highlightHeading = function (tab) {
  browser.tabs.sendMessage(tab.id, {
    from: "popup",
    subject: "highlightHeading",
  });
};

browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "context" && msg.subject === "showMessage") {
    showMessage(msg.message, msg.time);
  }
});

(async function Main() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });

  const tab = tabs[0];

  buttonOnClick("#buttonShowAltTexts", showAltText, false, true, tab);
  buttonOnClick("#buttonHighlightHeading", highlightHeading, false, true, tab);
  buttonOnClick("#buttonCopyAllLinks", "copyAllLinks", false, true);

  const ifJira = tab.url.match(regexJira);
  if (ifJira) {
    buttonOnClick("#buttonCreateWF", createWF, false, false, tab);
    return;
  }

  /*let ifPerf = url.replace(regexPerfProd, "$1") == "perf";
  let ifProd = url.replace(regexPerfProd, "$1") == "prod";*/

  const ifLive = tab.url.match(regexLive);
  const ifPerfProd = tab.url.match(regexPerfProd);

  if (ifLive || ifPerfProd) {
    buttonOnClick("#buttonCheckMothersite", checkMothersite, false, true, tab);
  }

  const ifAuthor = tab.url.match(regexAuthor);

  buttonOnClick("#buttonToLive", "toEnvironment", true, false, "live");
  buttonOnClick("#buttonToPerf", "toEnvironment", true, false, "perf");
  buttonOnClick("#buttonToProd", "toEnvironment", true, false, "prod");
  buttonOnClick("#buttonToClassic", "toEnvironment", true, false, classic);
  buttonOnClick("#buttonToTouch", "toEnvironment", true, false, touch);

  if (ifAuthor) {
    buttonOnClick(
      "#buttonOpenPropertiesTouchUI",
      "openPropertiesTouchUI",
      false,
      true
    );

    buttonOnClick("#buttonOpenInTree", "openInTree", false, true, tab);
  }
})();
