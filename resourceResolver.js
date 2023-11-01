window.ResourceResolverGetOrigPath = function () {
  const wrongLink = GMGetADeleteValue("WrongLink");
  if (wrongLink === "") {
    throw new Error("Link is not defined, resource resolver opened manually");
  }

  waitForAliasPath().then((form) => {
    form.value = wrongLink;

    const button = resolverToolButton();
    button.click();

    const interval = 500;
    const intervaID = setInterval(function () {
      const originalPath = originalPath().replace("-gf3-test", "");
      if (!originalPath.isEmpty) {
        return;
      }
      clearInterval(intervaID);

      makeRealAuthorLink(originalPath);
    }, interval);
  });
};

window.waitForAliasPath = function () {
  return waitForElm("#aliasPath");
};

window.resolverToolButton = function () {
  return document.querySelector("#resolvertool");
};

window.originalPath = function () {
  return document.querySelector("#originalPath").textContent;
};
