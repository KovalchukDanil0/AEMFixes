function ReplaceByRandElmArray(elm, replaceArray) {
  let string = elm.textContent;
  string = string.replace(/\S+/gm, function () {
    let replacedString =
      replaceArray[Math.floor(Math.random() * replaceArray.length)];

    if (elm.tagName != "P") {
      replacedString = replacedString.toUpperCase();
    }
    return replacedString;
  });

  return string;
}

function RandomProgrammerMemes() {
  if (document.title != "404") return;

  let githubPath =
    "https://raw.githubusercontent.com/deep5050/programming-memes/main/";

  const request = new XMLHttpRequest();

  request.open("GET", githubPath + "memes.json");
  request.send();

  request.onload = () => {
    if (request.status === 200) {
      console.log("Success"); // So extract data from json and create table

      let data = JSON.parse(request.response);
      let count = Object.keys(data).length;

      //Extracting data
      let memeImage = data[generateRandom(count - 1)].path;

      let arrayQuerySel = [
        "#accelerator-page > div.content > div > div.box-content.cq-dd-image > div > div.billboard.billboard-image-sets-height > div > div.billboard-inner",
        "#global-ux > div.content.clearfix > div:nth-child(1) > div.billboard.section > div > div.billboard-inner",
      ];

      let index = -1;
      let billboardContainer = null;
      while (index <= arrayQuerySel.length) {
        index += 1;
        billboardContainer = document.querySelector(arrayQuerySel[index]);

        if (billboardContainer != null) break;
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
      }

      billboardImages.forEach((image) => {
        image.srcset = githubPath + memeImage;
      });
    }
  };

  request.onerror = () => {
    throw new Error("no more memes error");
  };
}

function generateRandom(maxLimit) {
  let rand = Math.random() * maxLimit;
  rand = Math.floor(rand);

  return rand;
}

(function () {
  /*var regexFixShortLink =
    /((?:.+)?wwwperf\.)(brandeulb\.ford\.com(?:\/)?(?:editor\.html|cf#)?\/)(content\/(?:.+)?)/gm;
  if (window.location.href.match(regexFixShortLink)) {
    window.open(
      window.location.href.replace(
        regexFixShortLink,
        "$1brandeuauthorlb.ford.com/editor.html/$3"
      ),
      "_parent"
    );
    return;
  }*/

  RandomProgrammerMemes();

  /*if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/akam-sw.js").then(
        function (registration) {
          // Registration was successful
          alert(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        function (err) {
          // registration failed :(
          alert("ServiceWorker registration failed: ", err);
        }
      );
    }); 
  }*/
})();
