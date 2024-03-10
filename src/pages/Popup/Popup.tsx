import { Alert, Button, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import Browser, { Tabs } from "webextension-polyfill";
import {
  MessageCommon,
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
  regexCopyContent,
  touch,
} from "../../shared";
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
  buttonCopyContent: Function;
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

      if (separatorElm == null) {
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
          but-subject="createWF"
          but-send-as="tab"
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
          but-env="live"
          but-subject="toEnvironment"
          but-send-as="runtime"
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
          but-env="perf"
          but-subject="toEnvironment"
          but-send-as="runtime"
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
          but-env="prod"
          but-subject="toEnvironment"
          but-send-as="runtime"
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
          but-env={touch}
          but-subject="toEnvironment"
          but-send-as="runtime"
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
          but-env={classic}
          but-subject="toEnvironment"
          but-send-as="runtime"
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
  buttonCopyContent(url: string): React.ReactElement {
    if (ifAnyOfTheEnv(url) && ifAuthor(url)) {
      this.toolsButtonsExist();
      return (
        <Button
          size="lg"
          id="buttonCopyContent"
          color="purple"
          onClick={() => copyContent(url)}
        >
          Copy Content
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
          onClick={openPropertiesTouchUI}
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
          but-subject="openInTree"
          but-send-as="runtime"
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
          but-subject="checkReferences"
          but-send-as="tab"
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
          but-subject="checkMothersite"
          but-send-as="tab"
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

async function buttonOnClick(event: React.MouseEvent<HTMLButtonElement>) {
  const but: HTMLButtonElement = event.currentTarget;
  const sendAs = but.getAttribute("but-send-as")!;

  const tabs: Tabs.Tab[] = await Browser.tabs.query({
    highlighted: true,
    currentWindow: true,
  });

  const message: MessageCommon = {
    from: "popup",
    newTab: event.type !== "click",
    env: but.getAttribute("but-env")!,
    subject: but.getAttribute("but-subject")!,
    tabs,
  };

  if (sendAs == null) {
    return;
  }

  if (sendAs === "tab") {
    Browser.tabs.sendMessage(tabs[tabs.length - 1].id!, message);
  } else {
    Browser.runtime.sendMessage(message);
  }
}

async function openPropertiesTouchUI() {
  const tab: Tabs.Tab = await getCurrenTab();

  const newUrl: string = tab.url!.replace(
    regexAuthor,
    "https://wwwperf.brandeuauthorlb.ford.com/mnt/overlay/wcm/core/content/sites/properties.html?item=$2",
  );

  Browser.tabs.create({
    url: newUrl,
    index: tab.index + 1,
  });
}

async function copyContent(url: string) {
  const content: string = regexCopyContent.exec(url)?.[0]!;
  navigator.clipboard.writeText(content);
  showMessage(`${content} copied to clipboard`, 3000);
}

function showMessage(message: string, time: number) {
  if (statusBar == null) {
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
        {reactButtons.buttonCopyContent(tabUrl)}
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
