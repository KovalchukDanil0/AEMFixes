import Browser, { Tabs } from "webextension-polyfill";

export const touch = "editor.html";
export const classic = "cf#";

const mathAllNonCapt: string = /(?:.+)?/.source;
const authorBase: string = /wwwperf\.brandeuauthorlb\.ford\.com/.source;
const authorEnvBase = /(?:\/(?:editor\.html|cf#))?/.source;

const regexJira = /jira\.uhub\.biz\/browse\//;

export const regexWorkflow = new RegExp(
  mathAllNonCapt +
    authorBase +
    authorEnvBase +
    /\/etc\/workflow\/packages\/ESM\/(\w\w)(?:_)?(\w\w)?(?:\/\w\w(\w\w))?\/(ESM-?\d*-\w*?)\.html/
      .source +
    mathAllNonCapt,
);
export const regexDAMTree = new RegExp(
  mathAllNonCapt +
    authorBase +
    /\/damadmin#(\/content\/dam\/guxeu(?:-beta)?\/(?:\w\w|rhd)\/(?:\w\w_\w\w|central)\/(?:(mavs)\/)?(?:.+)?)/
      .source,
);

export const regexLive = new RegExp(
  mathAllNonCapt +
    /(?:secure|www)(?:\.(\w\w))?\.ford\.(\w\w)(?:\.(\w\w))?/.source +
    mathAllNonCapt,
);
export const regexPerfProd = new RegExp(
  mathAllNonCapt +
    /www(perf|prod)(?:-beta)?-(\w\w)(\w\w)?\.brandeulb\.ford\.com/.source +
    mathAllNonCapt,
);
export const regexAuthor =
  /(?:(?:.+)wwwperf\.brandeu(?:author)?lb\.ford\.com(?:\/(editor\.html|cf#))?)?(\/content\/guxeu(?:-beta)?\/(\w\w|mothersite)\/(?:(\w\w)_\w\w|configuration)\/(?:.*?))(?:\.html)?$/;

export const regexRemoveCommas = /.+(ESM-\d\d\d\d\d\d?).+/;

export const regexWrongPages =
  /content\/launches|content\/guxeu(?:-beta)?\/training-tree|content\/guxeu(?:-beta)?\/\w\w\/\w\w_\w\w\/home\/sandbox/;

const regexFastAuthor =
  /(.+wwwperf\.brandeu(author)?)(lb\.ford\.com\/)((?:editor\.html|cf#)\/)?(content(?:.+?(html)|.+)?)/;

const regexFixSiteWide =
  /((?:\S+)?\/content\/guxeu(?:-beta)?\/\w\w\/\w\w_\w\w)(\/home\/)(content)?(\S+)?/;

export const regexImagePicker = new RegExp(
  mathAllNonCapt +
    /(\/content\/dam\/guxeu.+?\.(?:jpeg|jpg|png))(?:\.renditions\..+)?/.source,
);
export const regexHTMLExist = new RegExp(
  /\.html/.source + `${mathAllNonCapt}$`,
);

export const regexWFTitle = new RegExp(
  /^(?:NWP_)?(\w\w)(\w\w)?/.source + mathAllNonCapt,
);

export const regexCopyContent = /\/content.+(?=\.html)/;

export const ifJira = (url: string): boolean => regexJira.test(url);

export const ifLive = (url: string): boolean => regexLive.test(url);

export const ifPerfProd = (url: string): boolean => regexPerfProd.test(url);
export const ifPerf = (url: string): boolean =>
  url.replace(regexPerfProd, "$1") === "perf";
export const ifProd = (url: string): boolean =>
  url.replace(regexPerfProd, "$1") === "prod";

export const ifAuthor = (url: string): boolean => regexAuthor.test(url);
export const ifClassic = (url: string): boolean =>
  url.replace(regexAuthor, "$1") === classic;
export const ifTouch = (url: string): boolean =>
  url.replace(regexAuthor, "$1") === touch;

export const ifAnyOfTheEnv = (url: string) =>
  regexLive.test(url) || regexPerfProd.test(url) || regexAuthor.test(url);

export const ifWorkflow = (url: string): boolean => regexWorkflow.test(url);

export const GUX3 = (): Element | null =>
  document.querySelector("#accelerator-page");

export const GUX1 = (): Element | null => document.querySelector("#global-ux");

export const nextGen = (): Element | null =>
  document.querySelector("#nextgen-page");

export interface MessageCommon {
  from: string;
  subject: string;
  env?: string;
  tabs?: Tabs.Tab[];
  newTab?: boolean;
  url?: string;
}

export default class AEMLink {
  url: URL;

  market = "xx";
  localLanguage = "xx";
  urlPart = "/";
  beta = "-beta";

  betaBool = false;
  authorBeta = false;
  isAuthor = false;

  marketsInBeta: string[] = [
    "uk",
    "de",
    "es",
    "fr",
    "nl",
    "it",
    "no",
    "at",
    "pt",
    "pl",
    "dk",
  ];

  marketsHomeNew: string[] = ["ie", "fi", "be", "cz", "hu", "gr", "ro", "lu"];

  constructor(url?: URL) {
    this.url = url!;

    if (url === undefined) {
      return;
    }

    this.urlPart = url.pathname + url.search + url.hash;
    if (this.urlPart === "/") {
      this.urlPart = "";
    }

    // Live
    if (regexLive.test(url.href)) {
      if (url.href.replace(regexLive, "$3") === "") {
        this.market = url.href.replace(regexLive, "$2");
        this.localLanguage = url.href.replace(regexLive, "$1");
      } else {
        this.market = url.href.replace(regexLive, "$3");
        this.localLanguage = url.href.replace(regexLive, "$2");
      }
    }
    // Perf & Prod
    else if (regexPerfProd.test(url.href)) {
      if (url.href.replace(regexPerfProd, "$3") === "uk") {
        this.market = url.href.replace(regexPerfProd, "$3");
        this.localLanguage = url.href.replace(regexPerfProd, "$2");
      } else {
        this.market = url.href.replace(regexPerfProd, "$2");
        this.localLanguage = url.href.replace(regexPerfProd, "$3");
      }
    }
    // Author
    else if (regexAuthor.test(url.href)) {
      this.market = url.href.replace(regexAuthor, "$3");
      this.localLanguage = this.fixLocalLanguage(
        false,
        url.href.replace(regexAuthor, "$4"),
      );

      this.isAuthor = true;
    } else {
      throw new Error("Link doesn't math any of the env");
    }

    this.isMarketInBeta();
    if (this.isAuthor) {
      if (this.betaBool) {
        this.authorBeta = true;
      } else {
        this.fixUrlPart();
      }
    }
  }

  isMarketInBeta(someMarket?: string): boolean {
    if (someMarket !== undefined) {
      this.market = someMarket!;
    }

    this.betaBool = !!this.marketsInBeta.some((link): boolean =>
      this.market.includes(link),
    );
    this.beta = this.betaBool ? "-beta" : "";

    return this.betaBool;
  }

  isMarketHasHomeNew = (): boolean =>
    !!this.marketsHomeNew.some((mar): boolean => this.market.includes(mar));

  fixMarket(someMarket?: string) {
    if (someMarket !== undefined) {
      this.market = someMarket;
    }

    const marketsFixAuthor = ["gb", "en", "gl"];
    const marketsFixPerf = ["uk", "uk", "mothersite"];

    let idx = marketsFixAuthor.indexOf(this.market);
    if (idx >= 0) {
      return marketsFixPerf[idx];
    }

    idx = marketsFixPerf.indexOf(this.market);
    if (idx >= 0) {
      return marketsFixAuthor[idx];
    }

    return this.market;
  }

  fixLocalLanguage(toAuthor = true, someLocalLang?: string) {
    if (someLocalLang !== undefined) {
      this.localLanguage = someLocalLang;
    }

    const properties: {
      [key: string]: string[];
    } = {
      uk: ["co", "en"],
      ie: ["", "en"],
      fr: ["", "fr"],
      lu: ["", "fr"],
      de: ["", "de"],
      at: ["", "de"],
      dk: ["", "da"],
      cz: ["", "cs"],
      gr: ["", "el"],
      fi: ["", "fi"],
      hu: ["", "hu"],
      ro: ["", "ro"],
      es: ["", "es"],
      nl: ["", "nl"],
      it: ["", "it"],
      no: ["", "no"],
      pt: ["", "pt"],
      pl: ["", "pl"],
    };

    const marketProp = properties[this.market as keyof typeof properties];
    if (marketProp !== undefined) {
      this.localLanguage = marketProp[+toAuthor];
    }

    return this.localLanguage;
  }

  fixUrlPart(someUrlPart = null) {
    if (someUrlPart !== null) {
      this.urlPart = someUrlPart;
    }

    const regexFixSWAuthor =
      /\S+?(site-wide-content|home-new|home)((?:\S+)?(?=\.html)|\S+)(?:\S+)?/gm;

    if (this.urlPart.replace(regexFixSWAuthor, "$1") === "site-wide-content") {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "/content$2");
    } else {
      this.urlPart = this.urlPart.replace(regexFixSWAuthor, "$2");
    }

    return this.urlPart;
  }

  async getAuthorRealUrl() {
    if (!this.authorBeta) {
      return this.urlPart;
    }

    const tab = await getCurrenTab();

    let html = null;
    const currTabUrl = tab.url;
    if (currTabUrl === undefined) {
      return;
    }

    if (!regexAuthor.test(currTabUrl)) {
      const regexDeleteEnv = /\/(?:editor\.html|cf#)/gm;
      const toEnvUrl = this.url.href.replace(regexDeleteEnv, "");

      const response = await fetch(toEnvUrl, {
        headers: {
          "User-Agent": "request",
        },
      });
      html = await response.text();
    }

    const callback = await Browser.tabs.sendMessage(tab.id!, {
      from: "background",
      subject: "getRealUrl",
      html,
    });
    this.urlPart = this.fixUrlPart(callback);

    return this.urlPart;
  }

  async determineEnv(env: string): Promise<string> {
    let newUrl: string;

    if (this.isAuthor) {
      if (env === classic || env === touch) {
        const notContainsAuthor: boolean =
          this.url.href.replace(regexFastAuthor, "$2") !== "author";
        const notContainsHtml: boolean =
          this.url.href.replace(regexFastAuthor, "$6") !== "html";

        newUrl = this.url.href.replace(
          regexFastAuthor,
          `$1${notContainsAuthor ? "author" : ""}$3${env + "/"}$5${
            notContainsHtml ? ".html" : ""
          }`,
        );

        return newUrl;
      }

      await this.getAuthorRealUrl();
    }

    switch (env) {
      case "live":
        newUrl = this.makeLive();
        break;
      case "perf":
        newUrl = this.makePerf();
        break;
      case "prod":
        newUrl = this.makeProd();
        break;
      case touch:
        newUrl = await this.makeTouch();
        break;
      case classic:
        newUrl = await this.makeClassic();
        break;
      default:
        throw new Error("No such environment");
    }

    return newUrl;
  }

  makeLive() {
    let britain = "";
    if (this.market === "uk") {
      britain = this.market;
      this.market = this.localLanguage + ".";
      this.localLanguage = "";
    }

    if (this.localLanguage !== "") {
      this.localLanguage += ".";
    }

    return `https://www.${this.localLanguage}ford.${this.market}${britain}${this.urlPart}`;
  }

  makePerf() {
    return this.makePerfProd(true);
  }

  makeProd() {
    return this.makePerfProd(false);
  }

  makePerfProd(isPerf: boolean) {
    if (this.market === "uk" || this.market === "gb") {
      [this.localLanguage, this.market] = [this.market, this.localLanguage];
    }

    return `https://www${isPerf ? "perf" : "prod"}${this.beta}-${this.market}${this.localLanguage}.brandeulb.ford.com${this.urlPart}`;
  }

  async makeTouch() {
    return this.makeAuthor(true);
  }

  async makeClassic() {
    return this.makeAuthor(false);
  }

  async makeAuthor(isTouch: boolean) {
    let wrongLink = `/content/guxeu${this.beta}/${
      this.market
    }/${this.fixLocalLanguage()}_${this.fixMarket()}/${
      this.isMarketHasHomeNew() && this.urlPart === "" ? "home-new" : "home"
    }${this.urlPart}`;

    if (wrongLink.replace(regexFixSiteWide, "$3") === "content") {
      wrongLink = wrongLink.replace(regexFixSiteWide, "$1/site-wide-content$4");
    }

    const response: Response = await fetch(
      "https://wwwperf.brandeuauthorlb.ford.com/bin/guxacc/tools/customslingresresolver?page-path=" +
        wrongLink,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const customResolverData: { map: { originalPath: string } } =
      await response.json();

    return this.makeRealAuthorLink(
      customResolverData.map.originalPath,
      isTouch,
    );
  }

  makeRealAuthorLink(wrongLink: string, isTouch: boolean) {
    return `https://wwwperf.brandeuauthorlb.ford.com/${isTouch ? "editor.html" : "cf#"}${wrongLink}.html`;
  }
}

export function addSharedDivClasses(divElm: HTMLDivElement) {
  const commonClassesDiv = [
    "box",
    "box-black-background",
    "box-regular-top-padding",
    "box-regular-bottom-padding",
    "box-small-left-right-padding",
    "richtext",
    "richtext-white",
    "nextgen-white-color",
  ];

  commonClassesDiv.forEach((clas) => {
    divElm.classList.add(clas);
  });
}

export function addBetaToLink(elm: HTMLAnchorElement) {
  const regexDetermineBeta = /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
  elm.href = elm.href.replace(regexDetermineBeta, `$1/${touch}$2`);
}

export function waitForElm(
  selector: string,
  doc: Document = document,
): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (doc.querySelector(selector)) {
      return resolve(doc.querySelector(selector) as HTMLElement);
    }

    const observer = new MutationObserver(() => {
      if (doc.querySelector(selector)) {
        resolve(doc.querySelector(selector) as HTMLElement);
        observer.disconnect();
      }
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
    });
  });
}

export const loadSavedData = (): Promise<Record<string, any>> =>
  Browser.storage.sync.get({
    disCreateWF: false,
    disMothersiteCheck: false,
    enableFunErr: false,
    enableFiltreFix: false,
    enableAutoLogin: false,
  });

export const getCurrenTab = async () =>
  (await Browser.tabs.query({ active: true, currentWindow: true }))[0]!;
