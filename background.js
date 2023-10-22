try {
  importScripts("node_modules/js-convert-case/dist/js-convert-case.js");
} catch (e) {
  console.error(e);
}

chrome.contextMenus.onClicked.addListener(menusOnClick);

function menusOnClick(info) {
  switch (info.menuItemId) {
    case "camelCase":
      console.log(jsConvert.toCamelCase("param-case"));
      break;
    default:
      console.log("Standard context menu item clicked.");
  }
}
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "toCamelCase",
    contexts: ["selection"],
    id: "camelCase",
  });
});
