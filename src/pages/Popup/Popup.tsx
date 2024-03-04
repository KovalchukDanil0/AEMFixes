import { Alert, Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import Browser, { Tabs } from "webextension-polyfill";
import {
  classic,
  getCurrenTab,
  ifAnyOfTheEnv,
  ifAuthor,
  ifClassic,
  ifJira,
  ifLive,
  ifPerf,
  ifProd,
  ifTouch,
  regexAuthor,
  touch,
} from "../SharedTools";
import "./Popup.css";

let statusBar: HTMLParagraphElement;

const reactButtons: {
  toolsButtonDisplayed: boolean;
  toolsButtonsExist: Function;
  buttonCreateWF: Function;
  buttonToLive: Function;
  buttonToPerf: Function;
  buttonToProd: Function;
  buttonToTouch: Function;
  buttonToClassic: Function;
  buttonOpenPropertiesTouchUI: Function;
  buttonOpenInTree: Function;
  buttonCheckReferences: Function;
  buttonCheckMothersite: Function;
} = {
  toolsButtonDisplayed: false,
  toolsButtonsExist() {
    if (!this.toolsButtonDisplayed) {
      const separatorElm: HTMLHRElement = document.getElementById(
        "separator",
      ) as HTMLHRElement;

      if (separatorElm === null) {
        return;
      }

      separatorElm.classList.remove("hidden");
      separatorElm.classList.add("block");
      this.toolsButtonDisplayed = true;
    }
  },
  buttonCreateWF(url: string): React.ReactElement {
    if (ifJira(url)) {
      return (
        <Button
          size="lg"
          id="buttonCreateWF"
          gradientDuoTone="purpleToBlue"
          onClick={buttonOnClick}
        >
          Create WF
        </Button>
      );
    }
    return <></>;
  },
  buttonToLive(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifLive(url)) {
      return (
        <Button
          size="lg"
          id="buttonToLive"
          color="success"
          onClick={buttonOnClick}
          onAuxClick={buttonOnClick}
        >
          To Live
        </Button>
      );
    }
    return <></>;
  },
  buttonToPerf(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifPerf(url)) {
      return (
        <Button
          size="lg"
          id="buttonToPerf"
          color="blue"
          onClick={buttonOnClick}
          onAuxClick={buttonOnClick}
        >
          To Perf
        </Button>
      );
    }
    return <></>;
  },
  buttonToProd(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifProd(url)) {
      return (
        <Button
          size="lg"
          id="buttonToProd"
          color="warning"
          onClick={buttonOnClick}
          onAuxClick={buttonOnClick}
        >
          To Prod
        </Button>
      );
    }
    return <></>;
  },
  buttonToTouch(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifTouch(url)) {
      return (
        <Button
          size="lg"
          id="buttonToTouch"
          onClick={buttonOnClick}
          onAuxClick={buttonOnClick}
        >
          To Touch
        </Button>
      );
    }
    return <></>;
  },
  buttonToClassic(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifClassic(url)) {
      return (
        <Button
          size="lg"
          id="buttonToClassic"
          color="failure"
          onClick={buttonOnClick}
          onAuxClick={buttonOnClick}
        >
          To Classic
        </Button>
      );
    }
    return <></>;
  },
  buttonOpenPropertiesTouchUI(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && ifAuthor(url)) {
      this.toolsButtonsExist();
      return (
        <Button
          size="lg"
          id="buttonOpenPropertiesTouchUI"
          color="light"
          onClick={buttonOnClick}
        >
          Open Properties Touch UI
        </Button>
      );
    }
    return <></>;
  },
  buttonOpenInTree(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && ifAuthor(url)) {
      this.toolsButtonsExist();
      return (
        <Button
          size="lg"
          id="buttonOpenInTree"
          color="success"
          onClick={buttonOnClick}
        >
          Open In Tree
        </Button>
      );
    }
    return <></>;
  },
  buttonCheckReferences(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && ifAuthor(url)) {
      this.toolsButtonsExist();
      return (
        <Button
          size="lg"
          id="buttonCheckReferences"
          color="failure"
          onClick={buttonOnClick}
        >
          Check references
        </Button>
      );
    }
    return <></>;
  },
  buttonCheckMothersite(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && !ifAuthor(url)) {
      this.toolsButtonsExist();
      return (
        <Button
          size="lg"
          id="buttonCheckMothersite"
          color="success"
          onClick={buttonOnClick}
        >
          Check mothersite links
        </Button>
      );
    }
    return <></>;
  },
};

export interface ButtonOnClick {
  from: string;
  subject: string;
  env?: string;
  tabs?: Tabs.Tab[];
  newTab?: boolean;
  url?: string;
}

async function buttonOnClick(event: React.MouseEvent<HTMLButtonElement>) {
  const but: HTMLButtonElement = event.currentTarget;

  const tab: Tabs.Tab[] = await Browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });

  const newTab: boolean = event.type !== "click";

  const message: ButtonOnClick = {
    from: "popup",
    env: "",
    subject: "toEnvironment",
    tabs: tab,
    newTab,
  };

  enum SendAs {
    Tab,
    Runtime,
    None,
  }

  const properties: {
    [key: string]: Function;
  } = {
    buttonCreateWF() {
      message.subject = "createWF";
      return SendAs.Tab;
    },
    buttonToLive() {
      message.env = "live";
      return SendAs.Runtime;
    },
    buttonToPerf() {
      message.env = "perf";
      return SendAs.Runtime;
    },
    buttonToProd() {
      message.env = "prod";
      return SendAs.Runtime;
    },
    buttonToTouch() {
      message.env = touch;
      return SendAs.Runtime;
    },
    buttonToClassic() {
      message.env = classic;
      return SendAs.Runtime;
    },
    buttonOpenPropertiesTouchUI() {
      openPropertiesTouchUI(tab[tab.length - 1]);
      return SendAs.None;
    },
    buttonOpenInTree() {
      message.subject = "openInTree";
      return SendAs.Runtime;
    },
    buttonCheckReferences() {
      message.subject = "checkReferences";
      return SendAs.Tab;
    },
    buttonCheckMothersite() {
      message.subject = "checkMothersite";
      return SendAs.Tab;
    },
  };

  const result: null = properties[but.id as keyof typeof properties]();
  if (result === SendAs.None) {
    return;
  }

  if (result === SendAs.Tab) {
    Browser.tabs.sendMessage(tab[tab.length - 1].id!, message);
  } else {
    Browser.runtime.sendMessage(message);
  }
}

function openPropertiesTouchUI(tab: Tabs.Tab) {
  const newUrl: string = tab.url!.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$2",
  );

  Browser.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
}

function showMessage(message: string, time: number) {
  if (statusBar === undefined) {
    statusBar = document.getElementById("statusBar") as HTMLParagraphElement;
  }
  const statusBarParent =
    statusBar.parentElement!.parentElement!.parentElement!;

  statusBar.textContent = message;
  statusBarParent.classList.remove("hidden");

  if (time > 0) {
    setTimeout(() => {
      statusBarParent.classList.add("hidden");
    }, time);
  }
}

Browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "popup") {
    return;
  }

  if (msg.subject === "showMessage") {
    showMessage(msg.message, msg.time);
  }
});

export default function Popup(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [tabUrl, setTabUrl] = useState<string>();

  async function buttonLogic() {
    const url: string = (await getCurrenTab()).url!;
    setTabUrl(url);

    setIsLoading(false);
  }

  useEffect(() => {
    buttonLogic();
  });

  if (isLoading) {
    return (
      <div className="grid h-44 place-items-center">
        <Spinner aria-label="Default status example" />
      </div>
    );
  }

  return (
    <main className="mx-3">
      <div className="my-3 flex place-content-center gap-2">
        {reactButtons.buttonCreateWF(tabUrl)}
      </div>
      <div className="my-3 flex place-content-center gap-2">
        {reactButtons.buttonToLive(tabUrl)}
        {reactButtons.buttonToPerf(tabUrl)}
        {reactButtons.buttonToProd(tabUrl)}
        {reactButtons.buttonToTouch(tabUrl)}
        {reactButtons.buttonToClassic(tabUrl)}
      </div>
      <hr id="separator" className="my-4 hidden h-px border-0 bg-gray-200" />
      <div className="my-3 flex flex-wrap place-content-center gap-2">
        {reactButtons.buttonOpenPropertiesTouchUI(tabUrl)}
        {reactButtons.buttonOpenInTree(tabUrl)}
        {reactButtons.buttonCheckReferences(tabUrl)}
        {reactButtons.buttonCheckMothersite(tabUrl)}
      </div>

      <Alert className="hidden" color="info">
        <p id="statusBar"></p>
      </Alert>

      <div className="mb-3 mt-10 flex place-content-between gap-2">
        <Button gradientDuoTone="tealToLime" href="options.html">
          <IoSettingsOutline className="mr-2 h-5 w-5" />
          Options
        </Button>
        <Button
          gradientDuoTone="redToYellow"
          href="https://github.com/KovalchukDanil0/AEMFixes#features"
          target="_blank"
        >
          <FaGithub className="mr-2 h-5 w-5" />
          See Guide
        </Button>
      </div>
    </main>
  );
}
