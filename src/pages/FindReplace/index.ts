import Browser from "webextension-polyfill";
import { MessageCommon, waitForElm } from "../SharedTools";

async function fixOldLinks() {
  await waitForElm(
    "#cq-gen4 > div.wrapper-conf > div > div.find-replace-links.ng-scope > div.content.ng-scope.last-concatenated > div > div > div > div.one-resource-header",
  );

  const oldLinks: NodeListOf<HTMLElement> = document.querySelectorAll(
    "#cq-gen4 > div.wrapper-conf > div > div.find-replace-links.ng-scope > div.content.ng-scope.last-concatenated > div > div > div > div > div > span",
  );
  oldLinks.forEach((link) => {
    const url: string = link.textContent!;
    const message: MessageCommon = {
      from: "content",
      subject: "openInTree",
      url,
    };

    link.innerHTML = "";

    const a = document.createElement("a");
    a.textContent = url;
    a.href = "#";
    a.addEventListener("click", function () {
      Browser.runtime.sendMessage(message);
    });

    link.appendChild(a);
  });
}

(async function Main() {
  const validateButton = await waitForElm(
    "#cq-gen4 > div.wrapper-conf > div > div.find-replace-links.ng-scope > div.content.first > div.root-path-selection > button:nth-child(4)",
  );
  validateButton.addEventListener("click", fixOldLinks);
})();
