const url = document.location.href;

window.getLinksInWF = function () {
  return document.querySelectorAll(".content-conf > .configSection > div a");
};

window.WFID = function () {
  return url.replace(regexWorkflow, "$4");
};

window.insertAfter = function (newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

String.prototype.addBetaToLink = function () {
  const regexDetermineBeta = /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
  return this.replace(regexDetermineBeta, "$1/editor.html$2");
};

window.AutoFillWF = function () {
  waitForElm("#CQ > div.cq-editrollover-insert-container").then(
    (createComponent) => {
      createComponent.dblclick();

      waitForElm(
        "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page"
      ).then((promPage) => {
        promPage.click();

        waitForElm(
          "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page.x-btn-selected"
        ).then(() => {
          let OKButton = document.querySelector(
            "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
          );
          OKButton.click();

          waitForElm(
            "body > div.wrapper-conf > div > div:nth-child(3) > div > div > div.cq-element-filters > div.new"
          ).then((pagePlaceholder) => {
            setTimeout(function () {
              pagePlaceholder.dblclick();

              waitForElm(
                "#CQ > div:nth-child(7) > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div.x-tab-panel-bwrap > div > div > div > div > div:nth-child(1) > div.x-form-element > div > input"
              ).then((pagePathForm) => {
                setTimeout(function () {
                  pagePathForm.value =
                    "/content/guxeu/fi/fi_fi/home/hyotyajoneuvot/e-transit";

                  OKButton = document.querySelector(
                    "#CQ > div:nth-child(7) > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
                  );
                  OKButton.click();

                  setTimeout(function () {
                    AutoFillWF();
                  }, 10000);
                }, 1000);
              });
            }, 1000);
          });
        });
      });
    }
  );
};

window.waitForWorkflowTitleInput = function () {
  return waitForElm("#workflow-title-input");
};

// \/etc\/workflow\/packages\/ESM\/FRFR\/ESM-157004(-\w+)?\.html

window.AddWFID = function () {
  waitForWorkflowTitleInput().then((form) => {
    const WorkflowID = WFID();

    form.value = WorkflowID;
    getLinksInWF().forEach((data) => (data.href = data.href.addBetaToLink()));

    const requestButton = document.querySelector("#start-request-workflow");
    requestButton.removeAttribute("disabled");
  });
};

window.NewWFDesign = function () {
  document
    .querySelectorAll('style,link[rel="stylesheet"]')
    .forEach((item) => item.remove());

  // add "WFPage.css"
};

// body > div.wrapper-conf > div > div.content-conf.workflow-package-page > div.configSection > div > div:nth-child(2)
window.UsefulLinks = async function () {
  const container = await waitForElm(
    "body > div.wrapper-conf > div > div.content-conf.workflow-package-page > div.configSection > div > div:nth-child(2)"
  );
  const ULinkContainer = container.cloneNode(false);

  const data = AEMLink;

  data.market = url.replace(regexWorkflow, "$1").toLowerCase();
  data.localLanguage = url.replace(regexWorkflow, "$2$3").toLowerCase();

  const wrongMarkets = ["da", "cs", "el"];
  const ifWrongMarket = function () {
    return !!wrongMarkets.some((mar) => data.market.includes(mar));
  };
  if (ifWrongMarket()) {
    [data.market, data.localLanguage] = [data.localLanguage, data.market];
  }

  data.isMarketInBeta();
  data.env = "cf#";

  const swapLocalLangMarkets = ["at", "dk"];
  const ifSwapLocalLangMarkets = function () {
    return !swapLocalLangMarkets.some((mar) => data.market.includes(mar));
  };

  const marketPath = `/content/guxeu${data.beta}/${data.fixMarket()}/${
    data.betaBool && ifSwapLocalLangMarkets()
      ? data.market
      : data.fixLocalLanguage()
  }_${
    data.betaBool && ifSwapLocalLangMarkets() ? data.localLanguage : data.market
  }`;

  if (!data.betaBool) {
    addDisclosure(true);
  }

  const betaButAcc = ["es", "it"];
  if (betaButAcc.some((mar) => data.market.includes(mar))) {
    addDisclosure(true);
  } else {
    addDisclosure();
  }

  function addDisclosure(acc = false) {
    const disclosureLibrary = `/site-wide-content/${
      acc ? "acc-" : ""
    }disclosure-library.html`;

    const fullPath = `${marketPath}${disclosureLibrary}`;

    const a = document.createElement("a");
    a.href = fullPath;
    a.target = "_blank";

    const linkText = document.createTextNode(fullPath);
    a.appendChild(linkText);

    ULinkContainer.appendChild(a);

    const lineBreak = document.createElement("br");
    a.appendChild(lineBreak);

    container.parentNode.insertBefore(ULinkContainer, container);
  }
};

(function WorkflowFixes() {
  //NewWFDesign();
  AddWFID();
  UsefulLinks();
  //AutoFillWF();
})();
