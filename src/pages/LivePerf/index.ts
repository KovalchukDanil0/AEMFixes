import Browser, { Runtime } from "webextension-polyfill";
import {
  addSharedDivClasses,
  GUX3,
  loadSavedData,
  regexAuthor,
  waitForElm,
} from "../SharedTools";

const url: string = window.location.href;

let wizardConfig: HTMLElement;
let wizardVehicleSelector: HTMLElement;

interface VehicleConfig {
  data: Data[];
}

interface Data {
  eventItem: CarProps[];
}

interface CarProps {
  desc: string;
  wersCode: string;
  modelCode: string;
  derivativeCode: string;
  wersDerivCode: string;
}

let vehicleConfig: VehicleConfig;
let lastVehicleIndex: number = -1;

async function randomProgrammerMemes() {
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

      let billboardContainer: string;
      let billboardImages: HTMLElement;
      let billboardText: HTMLElement;

      if (GUX3() !== null) {
        billboardContainer =
          "#accelerator-page > div.content > div > div.box-content.cq-dd-image > div > div.billboard.billboard-image-sets-height > div > div.billboard-inner";

        billboardImages = document.querySelector(
          billboardContainer + " > div > picture",
        ) as HTMLPictureElement;

        billboardText = document.querySelector(
          billboardContainer + " > div.billboard-paragraph",
        )!;

        billboardText.remove();
      } else {
        billboardContainer =
          "#global-ux > div.content.clearfix > div:nth-child(1) > div.billboard.section > div > div.billboard-inner";

        billboardImages = document.querySelector(
          billboardContainer + " > div > div > picture",
        ) as HTMLPictureElement;

        billboardText = document.querySelector(
          billboardContainer + " > div.billboard-paragraph",
        )!;

        billboardText.remove();
      }

      (billboardImages.childNodes as NodeListOf<HTMLSourceElement>).forEach(
        (image) => {
          image.srcset = githubPath + memeImage;
        },
      );
    }
  };

  request.onerror = () => {
    throw new Error("no more memes error");
  };
}

function generateRandom(maxLimit: number) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand);

  return rand;
}

function checkMothersite(from: string) {
  if (url.replace(regexAuthor, "$3") === "mothersite") {
    return;
  }

  const links: NodeListOf<HTMLLinkElement> =
    document.querySelectorAll("[href]");

  let mothersiteLinks: number = 0;
  links.forEach((element) => {
    if (element.href.includes("mothersite")) {
      element.style.backgroundColor = "blue";
      element.style.filter = "invert(100%)";

      mothersiteLinks += 1;
    }
  });

  const messageText = `MOTHERSITE LINKS ON THIS PAGE - ${mothersiteLinks}`;

  if (from === "content" && mothersiteLinks > 0) {
    const divBoxAlert: HTMLDivElement = document.createElement("div");
    addSharedDivClasses(divBoxAlert);
    divBoxAlert.id = "alertBanner";
    divBoxAlert.style.textAlign = "center";

    const p = document.createElement("p");
    p.textContent = messageText;
    divBoxAlert.appendChild(p);

    const page = GUX3()!;

    page.insertBefore(divBoxAlert, page.firstChild);
  } else {
    Browser.runtime.sendMessage({
      from: "context",
      subject: "showMessage",
      message: messageText,
      time: 5000,
    });
  }
}

function getCarByName(data: CarProps[], value: string): CarProps {
  return data.filter((el) => el.desc === value)[0];
}

async function vehicleCodeInit() {
  const wizardWindow = "div.wizard.initialized-wizard.ng-scope > ";

  wizardConfig = await waitForElm(wizardWindow + "span.configuration");

  await waitForElm(
    wizardWindow +
      "div.ng-scope > div > div.steps-wrapper.full-view > div.wizard-vehicle-selector.ng-scope > div.vehicle-list > figure:nth-child(1)",
  );

  wizardVehicleSelector = document.querySelector(".wizard-vehicle-selector")!;

  const buttonContainer: HTMLElement = wizardVehicleSelector.querySelector(
    "div.category-buttons > div.category-buttons-container",
  )!;

  const butContChildren = buttonContainer.children;
  for (let index = 0; index < butContChildren.length; index++) {
    const but = butContChildren[index];
    but.addEventListener("click", () => findVehicleCode(index));
  }

  findVehicleCode();
}

async function findVehicleCode(idx: number = 0) {
  if (lastVehicleIndex === idx) {
    return;
  }
  lastVehicleIndex = idx;

  if (vehicleConfig === null || vehicleConfig === undefined) {
    const config = `${wizardConfig.getAttribute(
      "data-nameplate-service",
    )}/${wizardConfig.getAttribute(
      "data-campaign-code",
    )}/${wizardConfig.getAttribute("data-site-id")}/${wizardConfig.getAttribute(
      "data-event-type",
    )}?locale=${wizardConfig.getAttribute("data-culture-code")}`;

    const response = await fetch(config, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    vehicleConfig = await response.json();
  }

  const allCars: NodeListOf<HTMLParagraphElement> =
    wizardVehicleSelector.querySelectorAll(
      "div.vehicle-list > figure > div > figcaption > a:not(#carCode)",
    );

  allCars.forEach((car) => {
    car.id = "carCode";

    const carName = car.textContent!.trim();

    const carObj: CarProps = getCarByName(
      vehicleConfig.data[0].eventItem,
      carName,
    );

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

    car.parentElement!.appendChild(carCode);
  });
}

async function findShowroomCode() {
  const showroom = await waitForElm("#acc-showroom");

  const showroomElm = await waitForElm("#acc-showroom > span");
  const config: string = showroomElm.getAttribute("data-bsl-url")!;

  const response = await fetch(config, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const showroomConfig = await response.json();

  const dataJSON = showroomConfig.data;

  const container = document.createElement("div");
  addSharedDivClasses(container);
  showroom.appendChild(container);

  for (const key in dataJSON) {
    if (Object.hasOwn(dataJSON, key)) {
      const element: { name: string; code: string } = dataJSON[key];

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
}

Browser.runtime.onMessage.addListener(
  (msg: any, _sender: Runtime.MessageSender, _sendResponse: Function) => {
    if (msg.from === "popup" && msg.subject === "checkMothersite") {
      checkMothersite(msg.from);
    }
  },
);

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
