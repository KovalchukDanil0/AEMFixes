function ResourceResolverGetOrigPath() {
  let wrongLink = GMGetADeleteValue("WrongLink");
  if (wrongLink == "")
    throw new Error("Link is not defined, resource resolver opened manually");

  waitForAliasPath().then((form) => {
    form.value = wrongLink;

    let button = resolverToolButton();
    button.click();

    const intervaID = setInterval(function () {
      const originalPath = originalPath().replace("-gf3-test", "");
      if (!originalPath.isEmpty) return;
      clearInterval(intervaID);

      makeRealAuthorLink(originalPath);
    }, 500);
  });
}

function waitForAliasPath() {
  return waitForElm("#aliasPath");
}

function resolverToolButton() {
  return document.querySelector("#resolvertool");
}

function originalPath() {
  return document.querySelector("#originalPath").textContent;
}
