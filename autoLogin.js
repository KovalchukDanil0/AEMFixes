function blurAll() {
  let tmp = document.createElement("input");
  document.body.appendChild(tmp);
  tmp.focus();
  document.body.removeChild(tmp);
}

(function AutoLogIn() {
  waitForElm("#input28").then((oktaForm) => {
    const intervaID = setInterval(function () {
      if (oktaForm.value.isEmpty()) {
        return;
      } else {
        document.activeElement.blur();
      }
      clearInterval(intervaID);

      let checkbox = document.querySelector("#input36");
      checkbox.click();

      let submitButton = document.querySelector(
        "#form20 > div.o-form-button-bar > input"
      );
      submitButton.click();
    }, 500);
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
    const intervaID = setInterval(function () {
      if (logInForm.value.isEmpty()) {
        return;
      } else {
        document.activeElement.blur();
      }
      clearInterval(intervaID);

      let logInButton = document.querySelector("#submitButton");
      logInButton.click();
    }, 500);
  });
})();
