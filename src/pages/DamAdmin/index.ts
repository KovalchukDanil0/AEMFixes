import { regexDAMTree, touch } from "../../shared";

console.log(regexDAMTree);
console.log(regexDAMTree.exec(document.location.href));

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
