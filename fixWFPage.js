var url = document.location.href;

function getLinksInWF() {
  return document.querySelectorAll(".content-conf > .configSection > div a");
}

function WFID() {
  return url.replace(regexWorkflow, "$1");
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

String.prototype.addBetaToLink = function () {
  const regexDetermineBeta = /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
  return this.replace(regexDetermineBeta, "$1/editor.html$2");
};

function AutoFillWF() {
  waitForElm("#CQ > div.cq-editrollover-insert-container").then(
    (createComponent) => {
      createComponent.dblclick();

      waitForElm(
        "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page"
      ).then((promPage) => {
        promPage.click();

        waitForElm(
          "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div > div > div > div.x-panel-bwrap > div > div > table.x-btn.x-btn-noicon.cq-cmpt-Content_32Promotion_32Page.x-btn-selected"
        ).then((promPageSelected) => {
          var OKButton = document.querySelector(
            "#CQ > div.x-window-plain.x-form-label-left > div > form > div.x-window.cq-insertdialog.cq-insertdialog-filters_47_42.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
          );
          OKButton.click();

          waitForElm(
            "body > div.wrapper-conf > div > div:nth-child(3) > div > div > div.cq-element-filters > div.new"
          ).then((pagePlaceholder) => {
            setTimeout(function () {
              pagePlaceholder.dblclick();

              waitForElm(
                "#CQ > div:nth-child(7) > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-ml > div > div > div > div > div.x-tab-panel-bwrap > div > div > div > div > div:nth-child(1) > div.x-form-element > div > input"
              ).then((pagePathForm) => {
                setTimeout(function () {
                  pagePathForm.value =
                    "/content/guxeu/fi/fi_fi/home/hyotyajoneuvot/e-transit";

                  var OKButton = document.querySelector(
                    "#CQ > div:nth-child(7) > div > form > div.x-window.x-window-plain.x-resizable-pinned > div.x-window-bwrap > div.x-window-bl > div > div > div > div.x-panel-fbar.x-small-editor.x-toolbar-layout-ct > table > tbody > tr > td.x-toolbar-right > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > table"
                  );
                  OKButton.click();

                  setTimeout(function () {
                    AutoFillWF();
                  }, 10000);
                }, 1000);
              });
            }, 1000);
          });
        });
      });
    }
  );
}

function waitForWorkflowTitleInput() {
  return waitForElm("#workflow-title-input");
}

(function WorkflowFixes() {
  waitForWorkflowTitleInput().then((form) => {
    var WorkflowID = WFID();

    form.value = WorkflowID;
    getLinksInWF().forEach((data) => (data.href = data.href.addBetaToLink()));

    /*$(
          "#cq-gen7 > div.wrapper-conf > div > div:nth-child(3) > div > div > div:nth-child(2)"
        ).bind("DOMNodeInserted", function () {
          alert("child is appended");
        });*/

    var requestButton = document.querySelector("#start-request-workflow");
    requestButton.removeAttribute("disabled");

    insertAfter(document.createTextNode(" "), requestButton);

    /*observeDOM(
      document.querySelector(
        "body > div.wrapper-conf > div > div:nth-child(3) > div > div > div.cq-element-filters"
      ),
      function (m) {
        var addedNodes = [],
          removedNodes = [];

        m.forEach(
          (record) =>
            record.addedNodes.length & addedNodes.push(...record.addedNodes)
        );

        m.forEach(
          (record) =>
            record.removedNodes.length &
            removedNodes.push(...record.removedNodes)
        );

        console.clear();
        console.log("Added:", addedNodes, "Removed:", removedNodes);
      }
    );*/
  });

  //AutoFillWF();
})();
