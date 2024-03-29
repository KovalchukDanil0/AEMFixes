import Browser from "webextension-polyfill";
import { waitForElm } from "../../shared";

async function createWF(WFTitle: string, WFName: string) {
  if (WFTitle === "" || WFName === "") {
    return;
  }

  const panelContent = "#cq-miscadmin-grid > div";

  await waitForElm(
    panelContent +
      " > div.x-panel-body.x-panel-body-noheader > div > div.x-grid3-viewport > div.x-grid3-scroller > div > div.x-grid3-row.x-grid3-row-first > table > tbody > tr > td.x-grid3-col.x-grid3-cell.x-grid3-td-title > div",
  );

  const button: HTMLButtonElement = document.querySelector(
    panelContent +
      " > div.x-panel-tbar.x-panel-tbar-noheader > div > table > tbody > tr > td.x-toolbar-left > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td.x-btn-mc > em > button",
  ) as HTMLButtonElement;
  button.click();

  const createPageOverlay =
    "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div";

  let form: HTMLFormElement = (await waitForElm(
    createPageOverlay + " > div:nth-child(1) > div.x-form-element > input",
  )) as HTMLFormElement;

  form.value = WFTitle;

  form = document.querySelector(
    createPageOverlay + " > div:nth-child(2) > div.x-form-element > input",
  ) as HTMLFormElement;
  form.value = WFName;

  const promotionButton = await waitForElm(
    createPageOverlay +
      " > div.x-panel.cq-template-view.x-panel-noborder > div > div > div > div.template-item:nth-child(3)",
  );

  promotionButton.click();
}

(async function Main() {
  const result = await Browser.storage.local.get({
    WFTitle: "",
    WFName: "",
  });

  const WFTitle = result["WFTitle"];
  const WFName = result["WFName"];

  createWF(WFTitle, WFName);

  Browser.storage.local.set({ WFTitle: "" });
  Browser.storage.local.set({ WFName: "" });
})();
