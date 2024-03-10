import { loadSavedData, waitForElm } from "../../shared";

function isEmpty(str: string) {
  return str.trim().length === 0;
}

async function autoLogIn() {
  const timeout = 500;

  const oktaForm: HTMLFormElement = (await waitForElm(
    "#input28",
  )) as HTMLFormElement;
  let intervalID = setInterval(function () {
    if (isEmpty(oktaForm.value)) {
      return;
    } else {
      const activeElm = document.activeElement as HTMLElement;
      activeElm.blur();
    }
    clearInterval(intervalID);

    const checkbox: HTMLButtonElement = document.querySelector(
      "#input36",
    ) as HTMLButtonElement;
    checkbox.click();

    const submitButton: HTMLButtonElement = document.querySelector(
      "#form20 > div.o-form-button-bar > input",
    ) as HTMLButtonElement;
    submitButton.click();
  }, timeout);

  waitForElm(
    "#okta-sign-in > div.auth-content > div > div > div.siw-main-body > form > div.authenticator-verify-list.authenticator-list > div > div:nth-child(2) > div.authenticator-description > div.authenticator-button > a",
  ).then((pushNotify) => {
    pushNotify.click();
  });

  waitForElm("#bySelection > div:nth-child(5)").then((activeDirectoryBtn) => {
    activeDirectoryBtn.click();
  });

  const logInForm: HTMLFormElement = (await waitForElm(
    "#userNameInput",
  )) as HTMLFormElement;
  intervalID = setInterval(function () {
    if (isEmpty(logInForm.value)) {
      return;
    } else {
      const activeElm = document.activeElement as HTMLElement;
      activeElm.blur();
    }
    clearInterval(intervalID);

    const logInButton: HTMLButtonElement = document.querySelector(
      "#submitButton",
    ) as HTMLButtonElement;
    logInButton.click();
  }, timeout);
}

(async function Main() {
  const savedData = await loadSavedData();

  if (savedData.enableAutoLogin) {
    autoLogIn();
  }
})();
