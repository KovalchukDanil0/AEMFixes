import ky from "ky";
import { sendMessage } from "./messaging";
import {
  domain,
  domainPerf,
  domainProd,
  fullAuthorPath,
  pathToResolver,
  regexAuthor,
  regexFastAuthor,
  regexFixSiteWide,
  regexLive,
  regexPerfProd,
  topLevelDomain,
} from "./storage";

interface OriginalPathType {
  map: {
    originalPath: string;
  };
}

export class UrlConverter {
  private readonly betaMarkets = [
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

  private readonly homeNewMarkets = [
    "ie",
    "fi",
    "be",
    "cz",
    "hu",
    "gr",
    "ro",
    "lu",
    "ch",
  ];

  isMarketInBeta = (market?: string) =>
    this.betaMarkets.some((marketBeta) => marketBeta === market);

  betaString = (beta: boolean) => (beta ? "-beta" : "");

  async convertLink(env: App.EnvTypes, url: URL): Promise<string> {
    const { pathname, search, hash, href } = url;

    let urlPart = pathname + search + hash;
    if (urlPart === "/") {
      urlPart = "";
    }

    const live = regexLive.exec(href);
    if (live) {
      const [, languageTmp, tld, domain] = live;

      const market = domain || tld;
      const language = domain ? tld : languageTmp;

      return this.determineEnv(env, href, false, urlPart, market, language);
    }

    const perf = regexPerfProd.exec(href);
    if (perf) {
      const [, , tld, domain] = perf;

      const isUk = domain === "uk";

      return this.determineEnv(
        env,
        href,
        false,
        urlPart,
        isUk ? domain : tld,
        isUk ? tld : domain,
      );
    }

    const author = regexAuthor.exec(href);
    if (author) {
      return this.determineEnv(
        env,
        href,
        true,
        pathname,
        author[4],
        this.fixLocalLanguage(author[4], author[5]),
      );
    }

    throw new Error(`${href} doesn't match any supported environment`);
  }

  private async determineEnv(
    env: App.EnvTypes,
    href: string,
    isAuthor: boolean,
    urlPart: string,
    market?: string,
    language?: string,
  ) {
    const beta = this.isBetaMarket(market);

    if (isAuthor) {
      if (env === "cf#" || env === "editor.html") {
        const match = regexFastAuthor.exec(href);

        if (!match) {
          throw new Error("Regex not matched fast author");
        }

        const [, domain, authorPart, authorEnv, , content, html] = match;

        return `${domain ?? ""}${
          authorPart === "author" ? "" : "author"
        }${authorEnv ?? ""}${env}/${content ?? ""}${html === "html" ? "" : ".html"}`;
      }

      urlPart = (await this.getPerfRealUrl(href)) ?? "";
    }

    switch (env) {
      case "live":
        return this.makeLive(urlPart, market, language);

      case "perf":
        return this.makePerfProd(true, urlPart, beta, market, language);

      case "prod":
        return this.makePerfProd(false, urlPart, beta, market, language);

      case "editor.html":
        return this.makeAuthor(true, beta, urlPart, market, language);

      case "cf#":
        return this.makeAuthor(false, beta, urlPart, market, language);

      default:
        throw new Error(`Unknown environment: ${env}`);
    }
  }

  private isBetaMarket(market?: string) {
    return this.betaMarkets.includes(market ?? "");
  }

  private betaSuffix(beta: boolean) {
    return beta ? "-beta" : "";
  }

  private hasHomeNew(market?: string) {
    return this.homeNewMarkets.some((m) => market?.includes(m));
  }

  public fixMarket(market?: string) {
    if (!market) return;

    const author = ["gb", "en", "gl"];
    const perf = ["uk", "uk", "mothersite"];

    const lower = market.toLowerCase();

    const idxAuthor = author.indexOf(lower);
    if (idxAuthor >= 0) return perf[idxAuthor];

    const idxPerf = perf.indexOf(lower);
    if (idxPerf >= 0) return author[idxPerf];

    return lower;
  }

  public fixLocalLanguage(
    market?: string,
    language?: string,
    toAuthor = false,
  ) {
    if (!market || market === language) {
      return "";
    }

    const map: Record<string, [string, string]> = {
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

    return map[market]?.[+toAuthor] ?? language;
  }

  private fixUrlPart(urlPart: string) {
    const regex =
      /\S+?(site-wide-content|home-new|home)((?:\S+)?(?=.html)|\S+)(?:\S+)?/gm;

    const match = regex.exec(urlPart);

    if (!match) {
      throw new Error("Regex not matched url part");
    }

    const [, siteWide, part] = match;

    return siteWide === "site-wide-content" ? `/content${part ?? ""}` : part;
  }

  private async getPerfRealUrl(url: string) {
    const [tab] = await browser.tabs.query({
      currentWindow: true,
      url,
    });

    if (!tab?.id) {
      throw new Error("Tab id is undefined");
    }

    const realUrl = await sendMessage("getRealUrl", undefined, tab.id);

    if (!realUrl) {
      throw new Error(
        "Cannot get alias of the page. Reload the page or open Touch UI.",
      );
    }

    return this.fixUrlPart(realUrl);
  }

  private makeLive(urlPart: string, market?: string, language?: string) {
    let uk = "";

    if (market === "uk") {
      uk = "uk";
      market = "co.";
      language = "";
    }

    return `https://www.${language ? `${language}.` : ""}${topLevelDomain}.${market ?? ""}${uk}${urlPart}`;
  }

  private makePerfProd(
    perf: boolean,
    urlPart: string,
    beta: boolean,
    market?: string,
    language?: string,
  ) {
    if (market === "uk" || market === "gb") {
      market = "co";
      language = "uk";
    }

    const subdomain = perf ? domainPerf : domainProd;

    return `https://${subdomain}${this.betaSuffix(beta)}-${market ?? ""}${language ?? ""}.${domain}.${topLevelDomain}.com${urlPart}`;
  }

  private async makeAuthor(
    touch: boolean,
    beta: boolean,
    urlPart: string,
    market?: string,
    language?: string,
  ) {
    let path =
      `/content/guxeu${this.betaSuffix(beta)}/${market ?? ""}/` +
      `${this.fixLocalLanguage(market, language, true) ?? ""}_${this.fixMarket(market) ?? ""}/` +
      `${this.hasHomeNew(market) && !urlPart ? "home-new" : "home"}${urlPart}`;

    const match = regexFixSiteWide.exec(path);

    if (!match) {
      throw new Error("Regex not matched site wide");
    }

    const [, domain, , content, part] = match;

    if (content === "/content") {
      path = `${domain ?? ""}/site-wide-content${part ?? ""}`;
    }

    const {
      map: { originalPath },
    } = await ky
      .get(`https://${fullAuthorPath}/${pathToResolver}${path}`, {
        headers: {
          Accept: "application/json",
        },
      })
      .json<OriginalPathType>()
      .catch(() => {
        throw new Error("Please log in to your AEM account");
      });

    return `https://${fullAuthorPath}/${touch ? "editor.html" : "cf#"}${originalPath}.html`;
  }
}

export const urlConverter = new UrlConverter();
