browser.runtime.onMessage.addListener(function (msg, _sender, _sendResponse) {
  if (msg.from === "context" && msg.subject === "monacoEditorInit") {
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

    editor.addAction({
      id: "save",
      label: "Save",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
        ),
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run(ed) {
        browser.runtime.sendMessage({
          from: "monaco",
          subject: "saveMonaco",
          monacoValue: editor.getValue(),
        });
      },
    });

    editor.trigger("editor", "editor.action.formatDocument");
  });
};
