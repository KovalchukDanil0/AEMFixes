const url = document.location.href;

window.insertAfter = function (newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

// ! NOT USE, NOT WORKING AT ALL, VERY UNSTABLE!!!
window.AutoFillWF = function () {
  waitForElm("#CQ > div.cq-editrollover-insert-container").then(
    (createComponent) => {
      createComponent.dblclick();

      const somethingShared =
        "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap";

      waitForElm(
        somethingShared +
          " > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page"
      ).then((promPage) => {
        promPage.click();

        waitForElm(
          somethingShared +
            " > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page.x-btn-selected"
        ).then(() => {
          let OKButton = document.querySelector(
            somethingShared +
              " > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
          );
          OKButton.click();

          waitForElm(
            "body > div.wrapper-conf > div > div:nth-child(3) > div > div > div.cq-element-filters > div.new"
          ).then((pagePlaceholder) => {
            setTimeout(function () {
              pagePlaceholder.dblclick();

              const somethingShared2 =
                "#CQ > div:nth-child(7) > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap";
              waitForElm(
                somethingShared2 +
                  " > div.x-window-ml > div > div > div > div > div.x-tab-panel-bwrap > div > div > div > div > div:nth-child(1) > div.x-form-element > div > input"
              ).then((pagePathForm) => {
                setTimeout(function () {
                  pagePathForm.value =
                    "/content/guxeu/fi/fi_fi/home/hyotyajoneuvot/e-transit";

                  OKButton = document.querySelector(
                    somethingShared2 +
                      " > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
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

// \/etc\/workflow\/packages\/ESM\/FRFR\/ESM-157004(-\w+)?\.html

// TODO: new nodes text changing bugged
window.AddWFID = async function () {
  const sectionSelector = ".page.section > .configSection > div a";

  function getLinksInWF() {
    return document.querySelectorAll(sectionSelector);
  }

  function getLinkInSection(node) {
    return node.querySelector(sectionSelector);
  }

  function WFID() {
    return url.replace(regexWorkflow, "$4");
  }

  window.addBetaToLink = function (link) {
    const regexDetermineBeta = /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
    return link.replace(regexDetermineBeta, `$1/${touch}$2`);
  };

  const form = await waitForElm("#workflow-title-input");

  const WorkflowID = WFID();

  form.value = WorkflowID;
  getLinksInWF().forEach((data) => (data.href = addBetaToLink(data.href)));

  const requestButton = document.querySelector("#start-request-workflow");
  requestButton.removeAttribute("disabled");

  const wfContainer = await waitForElm(
    "body > div.wrapper-conf > div > div > div > div > div.cq-element-filters"
  );

  const observer = new MutationObserver(function (mutations) {
    for (let i = 0, len = mutations.length; i < len; i++) {
      const added = mutations[i].addedNodes;
      for (let j = 0, lenAdded = added.length; j < lenAdded; j++) {
        const node = added[j];

        console.log(node);

        editNode(node);
      }
    }
  });

  function editNode(node) {
    const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let textNode;

    while ((textNode = treeWalker.nextNode())) {
      console.log(getLinkInSection(textNode));
    }
  }

  observer.observe(wfContainer, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
};

window.NewWFDesign = function () {
  document
    .querySelectorAll('style,link[rel="stylesheet"]')
    .forEach((item) => item.remove());

  // add "WFPage.css"
};

window.UsefulLinks = async function () {
  const container = await waitForElm(
    "body > div.wrapper-conf > div > div.content-conf.workflow-package-page > div.configSection > div > div:nth-child(2)"
  );
  const ULinkContainer = container.cloneNode(false);

  const data = new AEMLink(classic);

  data.market = data.fixMarket(url.replace(regexWorkflow, "$1").toLowerCase());
  data.localLanguage = url.replace(regexWorkflow, "$2$3").toLowerCase();

  const wrongMarkets = ["da", "cs", "el"];
  const ifWrongMarket = !!wrongMarkets.some((mar) => data.market.includes(mar));

  if (ifWrongMarket) {
    [data.market, data.localLanguage] = [data.localLanguage, data.market];
  }

  data.isMarketInBeta();

  /*const swapLocalLangMarkets = ["at", "dk"];
  const ifSwapLocalLangMarkets = !swapLocalLangMarkets.some((mar) =>
    data.market.includes(mar)
  );*/

  // TODO: check how does this behave on other markets

  const marketPath = `/content/guxeu${data.beta}/${data.market}`;
  const marketLocalLangPart = `/${data.fixLocalLanguage()}_${data.fixMarket()}`;

  if (!data.betaBool) {
    addDisclosure(true);
  }

  const betaButAcc = ["es", "it"];
  if (betaButAcc.some((mar) => data.market.includes(mar))) {
    addDisclosure(true);
  } else {
    addDisclosure();
  }

  addMarketConfig();

  function addDisclosure(acc = false) {
    const disclosureLibrary = `/site-wide-content/${
      acc ? "acc-" : ""
    }disclosure-library`;

    const fullPath = marketPath + marketLocalLangPart + disclosureLibrary;
    addElem(fullPath);
  }

  function addMarketConfig() {
    const marketConfigPath = "/configuration/market-configuration";

    const fullPath = marketPath + marketConfigPath;
    addElem(fullPath);
  }

  function addElem(fullPath) {
    fullPath += ".html";

    const a = document.createElement("a");
    a.href = `/${data.env}${fullPath}`;
    a.target = "_blank";

    const linkText = document.createTextNode(fullPath);
    a.appendChild(linkText);

    ULinkContainer.appendChild(a);

    const lineBreak = document.createElement("br");
    a.appendChild(lineBreak);

    container.parentNode.insertBefore(ULinkContainer, container);
  }
};

(function Main() {
  //NewWFDesign();
  AddWFID();
  UsefulLinks();
  //AutoFillWF();
})();
