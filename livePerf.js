const url = window.location.href;

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

      let billboardContainer = null;
      let billboardImages = [];
      let billboardText;

      if (GUX3() !== null) {
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
    const divBoxAlert = document.createElement("div");
    divBoxAlert.addSharedDivClasses();
    divBoxAlert.id = "alertBanner";
    divBoxAlert.style.textAlign = "center";

    const p = document.createElement("p");
    p.textContent = messageText;
    divBoxAlert.appendChild(p);

    const page = GUX3();
    page.insertBefore(divBoxAlert, page.firstChild);
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

let wizardConfig;
let wizardVehicleSelector;

window.vehicleCodeInit = async function () {
  const wizardWindow = "div.wizard.initialized-wizard.ng-scope > ";

  wizardConfig = await waitForElm(wizardWindow + "span.configuration");

  await waitForElm(
    wizardWindow +
      "div.ng-scope > div > div.steps-wrapper.full-view > div.wizard-vehicle-selector.ng-scope > div.vehicle-list > figure:nth-child(1)"
  );

  wizardVehicleSelector = document.querySelector(".wizard-vehicle-selector");
  const buttonContainer = document.querySelector(
    "div.category-buttons > div.category-buttons-container",
    wizardVehicleSelector
  );

  const butContChildren = buttonContainer.children;
  for (let index = 0; index < butContChildren.length; index++) {
    const but = butContChildren[index];
    but.addEventListener("click", () => findVehicleCode(index));
  }

  findVehicleCode();
};

let vehicleConfig;
let lastVehicleIndex = -1;

window.findVehicleCode = async function (idx = 0) {
  if (lastVehicleIndex === idx) {
    return;
  }
  lastVehicleIndex = idx;

  if (vehicleConfig === null || vehicleConfig === undefined) {
    const config = `${wizardConfig.getAttribute(
      "data-nameplate-service"
    )}/${wizardConfig.getAttribute(
      "data-campaign-code"
    )}/${wizardConfig.getAttribute("data-site-id")}/${wizardConfig.getAttribute(
      "data-event-type"
    )}?locale=${wizardConfig.getAttribute("data-culture-code")}`;

    const response = await fetch(config, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    vehicleConfig = await response.json();
  }

  const allCars = wizardVehicleSelector.querySelectorAll(
    "div.vehicle-list > figure > div > figcaption > a:not(#carCode)"
  );

  allCars.forEach((car) => {
    car.id = "carCode";

    const carName = car.textContent.replace(regexRemoveSpaces, "");
    const carObj = getCarByName(vehicleConfig.data[idx].eventItem, carName);

    let modelCode;
    let versionCode;

    modelCode = carObj.wersCode;
    if (modelCode === "" || modelCode == null) {
      modelCode = carObj.modelCode;
      versionCode = carObj.derivativeCode;
    } else {
      versionCode = carObj.wersDerivCode;
    }

    let fullCode;
    fullCode = modelCode;
    if (versionCode !== "") {
      fullCode += `-${versionCode}`;
    }

    const carCode = document.createElement("a");
    carCode.textContent = fullCode;
    carCode.href = `?vehicleCode=${fullCode}`;
    carCode.classList.add("cta-pill", "cta-pill-primary");
    carCode.id = "carCode";
    car.parentElement.appendChild(carCode);
  });
};

window.findShowroomCode = async function () {
  const showroom = await waitForElm("#acc-showroom");

  const showroomElm = await waitForElm("#acc-showroom > span");
  const config = showroomElm.getAttribute("data-bsl-url");

  const response = await fetch(config, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const showroomConfig = await response.json();

  const dataJSON = showroomConfig.data;

  const container = document.createElement("div");
  container.addSharedDivClasses();
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
