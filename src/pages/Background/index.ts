import Browser, { Menus, Tabs } from "webextension-polyfill";
import { ButtonOnClick } from "../Popup/Popup";
import AEMLink, {
  classic,
  getCurrentTab,
  regexAuthor,
  regexHTMLExist,
  regexImagePicker,
  touch,
} from "../SharedTools";

function toEnvironment(
  tabs: Tabs.Tab[],
  newTab: boolean,
  env: string,
  url?: string,
) {
  tabs.forEach(async (tab) => {
    const tempUrl = url ?? tab.url!;

    const data = new AEMLink(new URL(tempUrl));
    const newUrl = await data.determineEnv(env);

    if (newTab) {
      Browser.tabs.create({ index: tab.index + 1, url: newUrl });
    } else {
      Browser.tabs.update(tab.id, {
        url: newUrl,
      });
    }
  });

  Browser.runtime.sendMessage({
    from: "background",
    subject: "showMessage",
    message: "ALL GOOD!!!",
    time: 0,
  });
}

const changeContentInTab = async function (
  content: string,
  urlPattern: string,
) {
  const tabs: Tabs.Tab[] = await Browser.tabs.query({
    currentWindow: true,
    url: urlPattern,
  });

  let tab: Tabs.Tab;
  const newUrl: string = `${urlPattern}#${content}`;
  if (tabs.length !== 0) {
    tab = tabs[0];

    Browser.tabs.highlight({ tabs: tab.index });
    Browser.tabs.update(tab.id, {
      url: newUrl,
    });
  } else {
    tab = await getCurrentTab();
    Browser.tabs.create({ url: newUrl, index: tab.index + 1 });
  }
};

const openInTree = async function (authorUrl: string) {
  authorUrl = authorUrl.replace(regexAuthor, "$2");

  changeContentInTab(
    authorUrl,
    "https://wwwperf.brandeuauthorlb.ford.com/siteadmin",
  );
};

Browser.runtime.onMessage.addListener(
  (msg: ButtonOnClick, _sender, _sendResponse) => {
    if (msg.from === "popup") {
      if (msg.subject === "toEnvironment") {
        toEnvironment(msg.tabs, msg.newTab, msg.env);
      }

      if (msg.subject === "openInTree") {
        openInTree(msg.tabs[msg.tabs.length - 1].url!);
      }
    }
  },
);

Browser.runtime.onInstalled.addListener(function () {
  Browser.contextMenus.create({
    title: "Open content in DAM",
    contexts: ["image"],
    id: "openInDAM",
  });

  Browser.contextMenus.create({
    title: "Open content in AEM tree",
    contexts: ["link", "selection"],
    id: "openInAEM",
  });

  Browser.contextMenus.create({
    title: "Open content in TouchUI",
    contexts: ["selection"],
    id: "openInTouchUI",
  });

  const parent = Browser.contextMenus.create({
    title: "To Environment",
    contexts: ["link"],
    id: "toEnvironment",
  });

  Browser.contextMenus.create({
    title: "To Live",
    contexts: ["link"],
    parentId: parent,
    id: "toLive",
  });

  Browser.contextMenus.create({
    title: "To Perf",
    contexts: ["link"],
    parentId: parent,
    id: "toPerf",
  });

  Browser.contextMenus.create({
    title: "To Prod",
    contexts: ["link"],
    parentId: parent,
    id: "toProd",
  });

  Browser.contextMenus.create({
    title: "To Touch",
    contexts: ["link"],
    parentId: parent,
    id: "toTouch",
  });

  Browser.contextMenus.create({
    title: "To Classic",
    contexts: ["link"],
    parentId: parent,
    id: "toClassic",
  });
});

async function menusOnClick(
  info: Menus.OnClickData,
  tabs: Tabs.Tab | undefined,
) {
  const tab = new Array(tabs) as Tabs.Tab[];
  switch (info.menuItemId) {
    case "openInDAM": {
      const imagePath: string = info.srcUrl!.replace(regexImagePicker, "$1");

      changeContentInTab(
        imagePath,
        "https://wwwperf.brandeuauthorlb.ford.com/damadmin",
      );

      break;
    }
    case "openInAEM": {
      let linkUrl: string;
      if (info.selectionText !== undefined) {
        linkUrl = `https://wwwperf.brandeuauthorlb.ford.com${info.selectionText}.html`;
      } else {
        linkUrl = info.linkUrl!;
      }

      openInTree(linkUrl);

      break;
    }
    case "openInTouchUI": {
      let content: string = info.selectionText!;
      if (!regexHTMLExist.test(content)) {
        content += ".html";
      }

      const newUrl: string = `https://wwwperf.brandeuauthorlb.ford.com/editor.html${content}`;
      Browser.tabs.create({
        url: newUrl,
        index: tab[tab.length - 1].index + 1,
      });

      break;
    }
    case "toLive":
      toEnvironment(tab, true, "live", info.linkUrl);
      break;
    case "toPerf":
      toEnvironment(tab, true, "perf", info.linkUrl);
      break;
    case "toProd":
      toEnvironment(tab, true, "prod", info.linkUrl);
      break;
    case "toTouch":
      toEnvironment(tab, true, touch, info.linkUrl);
      break;
    case "toClassic":
      toEnvironment(tab, true, classic, info.linkUrl);
      break;
    default:
      break;
  }
}

Browser.contextMenus.onClicked.addListener(menusOnClick);
