chrome.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  console.log(msg);

  if (msg.from === "context") {
    console.log("gg");
    monacoEditorInit(msg.text);
  }
});

window.monacoEditorInit = function (value) {
  require.config({
    paths: {
      vs: "/node_modules/monaco-editor/min/vs",
    },
  });

  require(["vs/editor/editor.main"], async function () {
    const editor = monaco.editor.create(document.getElementById("container"), {
      value,
      language: "html",
      theme: "vs-dark",
    });
  });
};
