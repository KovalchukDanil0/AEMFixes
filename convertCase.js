// TODO: check type if checkbox
window.replaceSelectedText = function (replacementText) {
  let sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      alert(range.commonAncestorContainer);
      range.deleteContents();
      range.insertNode(document.createTextNode(replacementText));
    }
  } else if (document.selection?.createRange) {
    range = document.selection.createRange();
    range.text = replacementText;
  } else {
    console.warn("nothing");
  }
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "background" && msg.subject === "convertCase") {
    replaceSelectedText(msg.text);
  }
});
