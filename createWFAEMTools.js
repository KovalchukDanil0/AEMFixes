function CreateWF(WFTitle, WFName) {
  if (WFTitle == "" || WFName == "")
    throw new Error(
      "WFTitle or WFName are not defined, workflows opened manually"
    );

  waitForElm(
    "#cq-gen75 > div.x-grid3-row.x-grid3-row-first > table > tbody > tr > td.x-grid3-col.x-grid3-cell.x-grid3-td-title > div"
  ).then((firstItemInList) => {
    var button = document.getElementById("cq-gen91");
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

chrome.storage.local.get(["WFTitle"]).then((result) => {
  var WFTitle = result["WFTitle"];

  chrome.storage.local.get(["WFName"]).then((result) => {
    var WFName = result["WFName"];

    CreateWF(WFTitle, WFName);

    chrome.storage.local.set({ WFTitle: "" });
    chrome.storage.local.set({ WFName: "" });
  });
});
