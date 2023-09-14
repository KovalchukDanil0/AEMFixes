function ResourceResolverGetOrigPath() {
  var wrongLink = GMGetADeleteValue("WrongLink");
  if (wrongLink == "")
    throw new Error("Link is not defined, resource resolver opened manually");

  waitForAliasPath().then((form) => {
    form.value = wrongLink;

    var button = resolverToolButton();
    button.click();

    var intervaID = setInterval(function () {
      var originalPath = originalPath().replace("-gf3-test", "");
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
