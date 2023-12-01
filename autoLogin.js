window.blurAll = function () {
  const tmp = document.createElement("input");
  document.body.appendChild(tmp);
  tmp.focus();
  document.body.removeChild(tmp);
};

window.autoLogIn = function () {
  const timeout = 500;

  waitForElm("#input28").then((oktaForm) => {
    const intervalID = setInterval(function () {
      if (oktaForm.value.isEmpty()) {
        return;
      } else {
        document.activeElement.blur();
      }
      clearInterval(intervalID);

      const checkbox = document.querySelector("#input36");
      checkbox.click();

      const submitButton = document.querySelector(
        "#form20 > div.o-form-button-bar > input"
      );
      submitButton.click();
    }, timeout);
  });

  waitForElm(
    "#okta-sign-in > div.auth-content > div > div > div.siw-main-body > form > div.authenticator-verify-list.authenticator-list > div > div:nth-child(2) > div.authenticator-description > div.authenticator-button > a"
  ).then((pushNotify) => {
    pushNotify.click();
  });

  waitForElm("#bySelection > div:nth-child(5)").then((activeDirectoryBtn) => {
    activeDirectoryBtn.click();
  });

  waitForElm("#userNameInput").then((logInForm) => {
    const intervalID = setInterval(function () {
      if (logInForm.value.isEmpty()) {
        return;
      } else {
        document.activeElement.blur();
      }
      clearInterval(intervalID);

      const logInButton = document.querySelector("#submitButton");
      logInButton.click();
    }, timeout);
  });
};

(function Main() {
  autoLogIn();
})();
