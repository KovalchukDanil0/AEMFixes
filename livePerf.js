const url = window.location.href;

let wizardVehicleSelector;
let vehicleConfig;
let lastVehicleIndex = -1;

let showroomConfig;

/*window.ReplaceByRandElmArray = function (elm, replaceArray) {
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
};*/

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
      const jsonData = JSON.parse(request.response);
      const count = Object.keys(jsonData).length;

      //Extracting data
      const memeImage = jsonData[generateRandom(count - 1)].path;

      const data = new AEMLink(url);
      console.log(data.fixMarket());
      console.log(data);

      let billboardContainer = null;
      let billboardImages = [];
      let billboardText;

      if (data.betaBool) {
        billboardContainer =
          "#accelerator-page > div.content > div > div.box-content.cq-dd-image > div > div.billboard.billboard-image-sets-height > div > div.billboard-inner";

        billboardImages = document.querySelectorAll(
          billboardContainer + " > div > picture > source"
        );

        billboardText = document.querySelector(
          billboardContainer + " > div.billboard-paragraph"
        );
        billboardText.remove();
      } else {
        billboardContainer =
          "#global-ux > div.content.clearfix > div:nth-child(1) > div.billboard.section > div > div.billboard-inner";

        billboardImages = document.querySelectorAll(
          billboardContainer + " > div > div > picture > source"
        );

        billboardText = document.querySelector(
          billboardContainer + " > div.billboard-paragraph"
        );
        billboardText.remove();
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
      from: "context",
      subject: "showMessage",
      message: messageText,
      time: 5000,
    });
  }
};

window.getCarByName = function (data, value) {
  return data.filter((el) => el.desc === value)[0];
};

window.vehicleCodeInit = async function () {
  wizardVehicleSelector = document.querySelector(".wizard-vehicle-selector");
  if (wizardVehicleSelector !== null) {
    await waitForElm(
      "div.category-buttons > div.category-buttons-container > button.ng-binding.ng-scope"
    );
    const buttons = wizardVehicleSelector.querySelectorAll(
      "div.category-buttons > div.category-buttons-container > button.ng-binding.ng-scope"
    );

    for (let index = 0; index < buttons.length; index++) {
      const but = buttons[index];
      but.addEventListener("click", () => findVehicleCode(index));
    }

    findVehicleCode();
  }
};

window.findVehicleCode = async function (idx = 0) {
  if (lastVehicleIndex === idx) {
    return;
  }
  lastVehicleIndex = idx;

  if (vehicleConfig === null || vehicleConfig === undefined) {
    const config = await browser.runtime.sendMessage({
      from: "context",
      subject: "getHAR",
    });
    if (config === null) {
      return;
    }

    const response = await fetch(config, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    vehicleConfig = await response.json();
  }

  const allCars = wizardVehicleSelector.querySelectorAll(
    "div.vehicle-list > figure > div > figcaption > a"
  );

  allCars.forEach((car) => {
    const carName = car.textContent.replace(regexRemoveSpaces, "");
    const carObj = getCarByName(vehicleConfig.data[idx].eventItem, carName);

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

window.findShowroomCode = async function () {
  const showroom = await waitForElm("#acc-showroom");
  if (showroom === null) {
    return;
  }

  if (showroomConfig === null || showroomConfig === undefined) {
    const config = await browser.runtime.sendMessage({
      from: "context",
      subject: "getShowroomConfig",
    });
    if (config === null) {
      return;
    }

    const response = await fetch(config, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    showroomConfig = await response.json();
  }

  const dataJSON = showroomConfig.data;

  const container = document.createElement("div");
  container.classList.add(
    "box",
    "box-black-background",
    "image",
    "image-color-white",
    "box-regular-top-padding",
    "box-regular-bottom-padding",
    "box-small-left-right-padding"
  );
  showroom.appendChild(container);

  for (const key in dataJSON) {
    if (Object.hasOwn(dataJSON, key)) {
      const element = dataJSON[key];

      const name = document.createElement("h3");
      name.innerText = element.name;
      container.appendChild(name);

      const code = document.createElement("p");
      code.innerText = element.code;
      container.appendChild(code);

      const breakLine = document.createElement("br");
      container.appendChild(breakLine);
    }
  }
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

  vehicleCodeInit();
  findShowroomCode();
})();
