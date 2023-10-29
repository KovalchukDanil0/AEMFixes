let altTextContainerElm;
let altShowed = false;
function ShowAltTexts() {
  if (!altShowed) {
    const imgElements = document.querySelectorAll("img");

    const noAltText = document.createElement("div");
    noAltText.classList.add("noAltText");
    noAltText.innerHTML = "This image is decoration";

    const altTextContainer = document.createElement("div");
    altTextContainer.classList.add("altTextExist");

    for (const element of imgElements) {
      let altText = element.title;

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
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "background" && msg.subject === "showAltTexts") {
    ShowAltTexts();
  }
});
