browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "background" && msg.subject === "checkMothersite") {
    CheckMothersite();
  }
});

function CheckMothersite() {
  let links = document.querySelectorAll("[href]");

  let mothersiteLinks = 0;
  links.forEach((element) => {
    if (element.href.includes("mothersite")) {
      element.style.backgroundColor = "blue";
      element.style.filter = "invert(100%)";

      mothersiteLinks += 1;
    }
  });

  browser.runtime.sendMessage({
    from: "background",
    subject: "showMessage",
    message: `MOTHERSITE LINKS ON THIS PAGE - ${mothersiteLinks}`,
    time: 5000,
  });
}
