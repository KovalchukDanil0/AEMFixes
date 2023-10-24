try {
  importScripts(
    "./node_modules/js-convert-case/dist/js-convert-case.js",
    "./node_modules/webextension-polyfill/dist/browser-polyfill.js"
  );
} catch (e) {
  console.error(e);
}

browser.contextMenus.onClicked.addListener(menusOnClick);

function menusOnClick(info) {
  switch (info.menuItemId) {
    case "camelCase":
      console.log(jsConvert.toCamelCase("param-case"));
      break;
    default:
      console.log("Standard context menu item clicked.");
  }
}
browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "toCamelCase",
    contexts: ["selection"],
    id: "camelCase",
  });
});
