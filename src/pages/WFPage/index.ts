import AEMLink, {
  addBetaToLink,
  regexWorkflow,
  waitForElm,
} from "../SharedTools";

const url = new URL(document.location.href);

async function AddWFID() {
  const sectionSelector = ".page.section > .configSection > div a";

  const getLinksInWF = (): NodeListOf<HTMLAnchorElement> =>
    document.querySelectorAll(sectionSelector);

  const WFID = () => url.href.replace(regexWorkflow, "$4");

  const form: HTMLFormElement = (await waitForElm(
    "#workflow-title-input",
  )) as HTMLFormElement;

  const WorkflowID = WFID();

  form.value = WorkflowID;
  getLinksInWF().forEach((link) => addBetaToLink(link));

  const requestButton: HTMLButtonElement = document.querySelector(
    "#start-request-workflow",
  ) as HTMLButtonElement;
  requestButton.removeAttribute("disabled");
}

async function UsefulLinks() {
  const container = await waitForElm(
    "body > div.wrapper-conf > div > div.content-conf.workflow-package-page > div.configSection > div > div:nth-child(2)",
  );
  const ULinkContainer = container.cloneNode(false);

  const data = new AEMLink();

  data.market = data.fixMarket(
    url.href.replace(regexWorkflow, "$1").toLowerCase(),
  );
  data.localLanguage = url.href.replace(regexWorkflow, "$2$3").toLowerCase();

  const wrongMarkets = ["da", "cs", "el"];
  const ifWrongMarket = !!wrongMarkets.some((mar) => data.market.includes(mar));

  if (ifWrongMarket) {
    [data.market, data.localLanguage] = [data.localLanguage, data.market];
  }

  data.isMarketInBeta();

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

  function addElem(fullPath: string) {
    fullPath += ".html";

    const a = document.createElement("a");
    a.href = `/cf#${fullPath}`;
    a.target = "_blank";

    const linkText = document.createTextNode(fullPath);
    a.appendChild(linkText);

    ULinkContainer.appendChild(a);

    const lineBreak = document.createElement("br");
    a.appendChild(lineBreak);

    container.parentNode!.insertBefore(ULinkContainer, container);
  }
}

(function Main() {
  AddWFID();
  UsefulLinks();
})();
