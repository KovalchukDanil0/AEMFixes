const url = window.location.href;

window.ReplaceByRandElmArray = function (elm, replaceArray) {
  let string = elm.textContent;
  string = string.replace(/\S+/gm, function () {
    let replacedString =
      replaceArray[Math.floor(Math.random() * replaceArray.length)];

    if (elm.tagName !== "P") {
      replacedString = replacedString.toUpperCase();
    }
    return replacedString;
  });

  return string;
};

window.randomProgrammerMemes = async function () {
  if (document.title !== "404") {
    return;
  }

  const githubPath =
    "https://raw.githubusercontent.com/deep5050/programming-memes/main/";

  const request = new XMLHttpRequest();

  request.open("GET", githubPath + "memes.json");
  request.send();

  request.onload = () => {
    const success = 200;

    if (request.status === success) {
      const data = JSON.parse(request.response);
      const count = Object.keys(data).length;

      //Extracting data
      const memeImage = data[generateRandom(count - 1)].path;

      const arrayQuerySel = [
        "#accelerator-page > div.content > div > div.box-content.cq-dd-image > div > div.billboard.billboard-image-sets-height > div > div.billboard-inner",
        "#global-ux > div.content.clearfix > div:nth-child(1) > div.billboard.section > div > div.billboard-inner",
      ];

      let index = -1;
      let billboardContainer = null;
      while (index <= arrayQuerySel.length) {
        index += 1;
        billboardContainer = document.querySelector(arrayQuerySel[index]);

        if (billboardContainer != null) {
          break;
        }
      }

      let billboardImages = [];
      let billboardText;
      switch (index) {
        case 0:
          billboardImages = document.querySelectorAll(
            arrayQuerySel[index] + " > div > picture > source"
          );

          billboardText = document.querySelector(
            arrayQuerySel[index] + " > div.billboard-paragraph"
          );
          billboardText.remove();

          break;
        case 1:
          billboardImages = document.querySelectorAll(
            arrayQuerySel[index] + " > div > div > picture > source"
          );

          billboardText = document.querySelector(
            arrayQuerySel[index] + " > div.billboard-paragraph"
          );
          billboardText.remove();

          break;
        default: {
          throw new Error("No such Error page");
        }
      }

      billboardImages.forEach((image) => {
        image.srcset = githubPath + memeImage;
      });
    }
  };

  request.onerror = () => {
    throw new Error("no more memes error");
  };
};

window.generateRandom = function (maxLimit) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand);

  return rand;
};

window.checkMothersite = function (from) {
  if (url.replace(regexAuthor, "$3") === "mothersite") {
    return;
  }

  const links = document.querySelectorAll("[href]");

  let mothersiteLinks = 0;
  links.forEach((element) => {
    if (element.href.includes("mothersite")) {
      element.style.backgroundColor = "blue";
      element.style.filter = "invert(100%)";

      mothersiteLinks += 1;
    }
  });

  const messageText = `MOTHERSITE LINKS ON THIS PAGE - ${mothersiteLinks}`;
  if (from === "content" && mothersiteLinks > 0) {
    // TODO: replace wih popup
    alert(messageText);
  } else {
    browser.runtime.sendMessage({
      from: "background",
      subject: "showMessage",
      message: messageText,
      time: 5000,
    });
  }
};

window.getCarByName = function (data, value) {
  return data.filter((el) => el.desc === value)[0];
};

window.findVehicleCode = async function () {
  /*const regexOverlayWithCode =
    /(?:wizard-overlays|next-steps|seuraavaksi)\/(?:kmi|sl1|tdr|request-a-test-drive|varaa-koeajo)/gm;
  if (!url.match(regexOverlayWithCode)) {
    return;
  }*/

  const config = await browser.runtime.sendMessage({
    from: "context",
    subject: "getHAR",
  });

  if (config === "") {
    return;
  }

  console.log(config);

  const response = await fetch(config, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const vehicleConfig = await response.json();

  const carCommonPath =
    "div.ng-scope > div > div.steps-wrapper.full-view > div.wizard-vehicle-selector.ng-scope > div.vehicle-list > figure > div > figcaption > a";
  const arrayQuerySel = [
    `#gux3 > div > div.box-content.cq-dd-image > div > div > div > div.wizard.initialized-wizard.ng-scope > ${carCommonPath}`,
    `#gux3 > div > ${carCommonPath}`,
    `#gux3 > div > div > div > ${carCommonPath}`,
  ];

  let index = -1;
  let allCars = null;
  while (index <= arrayQuerySel.length) {
    index += 1;
    allCars = document.querySelectorAll(arrayQuerySel[index]);

    console.log(allCars);

    if (allCars?.length !== 0) {
      break;
    }
  }

  allCars.forEach((car) => {
    const carName = car.textContent.replace(regexRemoveSpaces, "");
    const carObj = getCarByName(vehicleConfig.data[0].eventItem, carName);

    const wersCode = carObj?.wersCode;
    if (carObj == null || wersCode === "" || wersCode == null) {
      const p = document.createElement("p");
      p.textContent = "NO DATA";
      car.parentElement.appendChild(p);

      return;
    }

    const wersDerivCode = carObj.wersDerivCode;

    let fullCode = carObj.wersCode;
    if (wersDerivCode !== "") {
      fullCode += `-${wersDerivCode}`;
    }

    const a = document.createElement("a");
    a.textContent = fullCode;
    a.href = `?vehicleCode=${fullCode}`;

    car.parentElement.appendChild(a);
  });
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "checkMothersite") {
    checkMothersite(msg.from);
  }
});

(async function Main() {
  const savedData = await loadSavedData();

  if (!savedData.disMothersiteCheck) {
    checkMothersite("content");
  }

  if (savedData.enableFunErr) {
    randomProgrammerMemes();
  }

  findVehicleCode();
})();
