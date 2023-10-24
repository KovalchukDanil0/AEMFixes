function CreateWF(WFTitle, WFName) {
  if (WFTitle == "" || WFName == "")
    throw new Error(
      "WFTitle or WFName are not defined, workflows opened manually"
    );

  waitForElm(
    "#cq-gen75 > div.x-grid3-row.x-grid3-row-first > table > tbody > tr > td.x-grid3-col.x-grid3-cell.x-grid3-td-title > div"
  ).then((firstItemInList) => {
    let button = document.getElementById("cq-gen91");
    button.click();

    waitForElm("#ext-comp-1079").then((form) => {
      form.value = WFTitle;

      form = document.querySelector("#ext-comp-1080");
      form.value = WFName;
    });

    waitForElm("#ext-comp-1076 > div:nth-child(3)").then((promotionButton) => {
      promotionButton.click();
    });
  });
}

function AutoFillWF() {
  waitForElm("#CQ > div.cq-editrollover-insert-container").then(
    (createComponent) => {
      createComponent.dblclick();

      waitForElm(
        "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page"
      ).then((promPage) => {
        promPage.click();

        waitForElm(
          "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page.x-btn-selected"
        ).then((promPageSelected) => {
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

                  let OKButton = document.querySelector(
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
}

browser.storage.local.get(["WFTitle"]).then((result) => {
  let WFTitle = result["WFTitle"];

  browser.storage.local.get(["WFName"]).then((result) => {
    let WFName = result["WFName"];

    CreateWF(WFTitle, WFName);
    AutoFillWF();

    browser.storage.local.set({ WFTitle: "" });
    browser.storage.local.set({ WFName: "" });
  });
});
