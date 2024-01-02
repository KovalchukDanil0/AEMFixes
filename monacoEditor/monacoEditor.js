window.addEventListener("message", monacoEditorInit);

function monacoEditorInit(event) {
  const message = event.data;

  require.config({
    paths: {
      vs: "/node_modules/monaco-editor/min/vs",
    },
  });

  require(["vs/editor/editor.main"], async function () {
    const editor = monaco.editor.create(document.getElementById("container"), {
      value: message.text,
      language: "html",
      theme: "vs-dark",
    });
  });
}
