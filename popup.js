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

window.buttonOnClick = async function (but) {
  const tab = await getCurrentTab();
  const tabUrl = tab.url;

  const ifJira = tabUrl.match(regexJira);
  const ifLive = tabUrl.match(regexLive);

  const ifAuthor = tabUrl.match(regexAuthor);
  const ifClassic = tabUrl.replace(regexAuthor, "$1") === classic;
  const ifTouch = tabUrl.replace(regexAuthor, "$1") === touch;

  const ifAnyOfTheEnv = ifLive || ifPerfProd(tabUrl) || ifAuthor;

  let sendAsTab = false;
  const message = {
    tab,
    env: "",
    func: null,
    from: "popup",
    subject: "toEnvironment",
    newTab: false,
  };

  const properties = {
    buttonCreateWF() {
      sendAsTab = true;
      message.subject = "createWF";
      return ifJira;
    },
    buttonCheckMothersite() {
      sendAsTab = true;
      message.subject = "checkMothersite";
      return ifLive || ifPerfProd(tabUrl);
    },
    buttonShowAltTexts() {
      sendAsTab = true;
      message.subject = "showAltTexts";
      return true;
    },
    buttonHighlightHeading() {
      sendAsTab = true;
      message.subject = "highlightHeading";
      return true;
    },
    buttonCheckReferences() {
      sendAsTab = true;
      message.subject = "checkReferences";
      return ifAuthor;
    },
    buttonOpenInTree() {
      message.subject = "openInTree";
      return ifAuthor;
    },
    buttonCopyAllLinks() {
      message.func = copyAllLinks;
      return true;
    },
    buttonOpenPropertiesTouchUI() {
      message.func = openPropertiesTouchUI;
      return ifAuthor;
    },
    buttonToLive() {
      message.env = "live";
      return !ifLive && ifAnyOfTheEnv;
    },
    buttonToPerf() {
      message.env = "perf";
      return !ifPerf(tabUrl) && ifAnyOfTheEnv;
    },
    buttonToProd() {
      message.env = "prod";
      return !ifProd(tabUrl) && ifAnyOfTheEnv;
    },
    buttonToClassic() {
      message.env = classic;
      return !ifClassic && ifAnyOfTheEnv;
    },
    buttonToTouch() {
      message.env = touch;
      return !ifTouch && ifAnyOfTheEnv;
    },
  };
  const checkButton = properties[but.id];
  if (checkButton !== undefined && !checkButton()) {
    but.style.display = "none";
    return;
  }

  but.addEventListener("click", sendMessage);

  but.addEventListener("auxclick", function (e) {
    if (e.button !== 1) {
      return;
    }
    message.newTab = true;

    sendMessage();
  });

  function sendMessage() {
    if (typeof message.func === "function") {
      message.func(tab);
    } else {
      //but.classList.add("is-loading");

      if (sendAsTab) {
        browser.tabs.sendMessage(tab.id, message);
      } else {
        browser.runtime.sendMessage(message);
      }
    }
  }
};

window.copyAllLinks = async function () {
  let highlightedPageLinks = "";

  const tabs = await browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });

  for (const element of tabs) {
    const tab = element;
    highlightedPageLinks += tab.url + "\n\n";
  }

  browser.tabs.sendMessage(tabs[0].id, {
    from: "popup",
    subject: "writeToClipboard",
    text: highlightedPageLinks,
  });

  showMessage(`LINKS COPIED TO CLIPBOARD:\n ${highlightedPageLinks}`, 5000);
};

window.openPropertiesTouchUI = async function () {
  const tab = await getCurrentTab();

  const newUrl = tab.url.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$2"
  );

  browser.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
};

browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "popup") {
    return;
  }

  if (msg.subject === "showMessage") {
    showMessage(msg.message, msg.time);
  }
});

(async function Main() {
  const buttons = document.querySelectorAll("button.button");
  buttons.forEach((but) => {
    buttonOnClick(but);
  });
})();
