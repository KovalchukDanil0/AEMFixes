import { regexDAMTree, touch } from "../SharedTools";

window.addEventListener(
  "hashchange",
  () => {
    const url = window.location.href;
    const mav = url.replace(regexDAMTree, "$3");

    if (mav === "mavs") {
      const linkPart = url.replace(regexDAMTree, "$2");
      window.open(
        `https://wwwperf.brandeuauthorlb.ford.com/${touch}` + linkPart,
      );
    }
  },
  false,
);
