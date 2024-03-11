import { regexDAMTree, touch } from "../../shared";

window.addEventListener(
  "hashchange",
  () => {
    const url = window.location.href;
    const mav = url.replace(regexDAMTree, "$2");

    if (mav === "mavs") {
      const linkPart = url.replace(regexDAMTree, "$1");
      window.open(
        `https://wwwperf.brandeuauthorlb.ford.com/${touch}` + linkPart,
      );
    }
  },
  false,
);
