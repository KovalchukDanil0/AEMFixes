(function () {
  waitForElm(
    "body > div > div > div.find-replace-links.ng-scope > div.content.first > div.root-path-selection > button.find-links"
  ).then((findLinksButton) => {
    findLinksButton.addEventListener("click", function () {
      const validateButton = document.querySelector(
        "body > div > div > div.find-replace-links.ng-scope > div.content.first > div.root-path-selection > button:nth-child(4)"
      );
      validateButton.click();
    });
  });
})();
