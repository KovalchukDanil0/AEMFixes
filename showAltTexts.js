let altTextContainerElm;
let altShowed = false;
window.ShowAltTexts = function () {
  if (!altShowed) {
    const imgElements = document.querySelectorAll("img");

    const noAltText = document.createElement("div");
    noAltText.classList.add("noAltText");
    noAltText.innerHTML = "This image is decoration";

    const altTextContainer = document.createElement("div");
    altTextContainer.addSharedDivClasses();
    altTextContainer.classList.add("altTextExist");

    for (const element of imgElements) {
      const altText = element.title;

      if (altText === "") {
        element.after(noAltText.cloneNode(true));
      } else {
        const altTextElm = document.createElement("p");
        altTextElm.textContent = altText;

        altTextContainer.appendChild(altTextElm);
      }
    }

    altTextContainerElm = document.body.appendChild(altTextContainer);
    altShowed = true;
  } else {
    document.querySelectorAll(".noAltText").forEach((element) => {
      element.remove();
    });
    altTextContainerElm.remove();

    altShowed = false;
  }
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "showAltTexts") {
    ShowAltTexts();
  }
});
