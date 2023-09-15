var altTextContainerElm;
var altShowed = false;
function ShowAltTexts() {
  var SATMenuText;
  if (!altShowed) {
    const imgElements = document.querySelectorAll("img");

    const noAltText = document.createElement("div");
    noAltText.classList.add("noAltText");
    noAltText.innerHTML = "This image is decoration";

    const altTextContainer = document.createElement("div");
    altTextContainer.classList.add("altTextExist");

    for (let i = 0; i < imgElements.length; i++) {
      var altText = imgElements[i].title;

      if (altText === "") {
        imgElements[i].after(noAltText.cloneNode(true));
      } else {
        const altTextElm = document.createElement("p");
        altTextElm.textContent = altText;

        altTextContainer.appendChild(altTextElm);
      }
    }

    altTextContainerElm = document.body.appendChild(altTextContainer);

    SATMenuText = "HIDE ALT TEXTS";
    altShowed = true;
  } else {
    document.querySelectorAll(".noAltText").forEach((element) => {
      element.remove();
    });
    altTextContainerElm.remove();

    SATMenuText = "SHOW ALT TEXTS";
    altShowed = false;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "popup" && msg.subject === "showAltTexts") {
    ShowAltTexts();
  }
});
