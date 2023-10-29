let statusBar;
function ShowMessage(message, time) {
  if (statusBar == null) statusBar = document.getElementById("statusBar");

  statusBar.textContent = message;
  statusBar.style.display = "inherit";
  if (time != Number.MAX_VALUE) {
    setTimeout(() => {
      statusBar.style.display = "none";
    }, time);
  }
}

function ButtonOnClick(selector, func, showLoading, once, ...args) {
  let button = document.querySelector(selector);
  button.disabled = false;

  button.addEventListener("click", async function () {
    if (showLoading) button.classList.add("is-loading");

    await browser.runtime.sendMessage({
      from: "popup",
      subject: "buttonClick",
      once: once,
      func: func,
      newTab: false,
      args: args,
    });
  });
  button.addEventListener("auxclick", async function (e) {
    if (e.button != 1) return;

    if (showLoading) button.classList.add("is-loading");

    await browser.runtime.sendMessage({
      from: "popup",
      subject: "buttonClick",
      once: once,
      func: func,
      newTab: true,
      args: args,
    });
  });
}

browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.from === "background" && msg.subject === "showMessage") {
    ShowMessage(msg.message, msg.time);
  }
});

(async function ButtonsEvents() {
  let tabs = await browser.tabs.query({ active: true, currentWindow: true });

  const tab = tabs[0];
  const url = tab.url;

  ButtonOnClick("#buttonShowAltTexts", "ShowAltText", false, true, tab);

  ButtonOnClick("#buttonCopyAllLinks", "CopyAllLinks", false, true);

  //HighlightHeading()

  let ifJira = url.match(regexJira);
  if (ifJira) {
    ButtonOnClick(
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

  let ifAuthor = url.match(regexAuthor);

  ButtonOnClick("#buttonToLive", "ToEnvironment", true, false, "live");
  ButtonOnClick("#buttonToPerf", "ToEnvironment", true, false, "perf");
  ButtonOnClick("#buttonToProd", "ToEnvironment", true, false, "prod");
  ButtonOnClick("#buttonToClassic", "ToEnvironment", true, false, "cf#");
  ButtonOnClick("#buttonToTouch", "ToEnvironment", true, false, "editor.html");

  if (ifAuthor) {
    ButtonOnClick(
      "#buttonOpenPropertiesTouchUI",
      "openPropertiesTouchUI",
      false,
      true
    );
  }
})();
