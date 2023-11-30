const className = "highlight-heading-ext";
const headings = {
  h1: {
    elements: [],
    bg: "yellow",
    color: "#000",
    count: 0,
  },
  h2: {
    elements: [],
    bg: "orange",
    color: "#000",
    count: 0,
  },
  h3: {
    elements: [],
    bg: "blue",
    color: "#fff",
    count: 0,
  },
  h4: {
    elements: [],
    bg: "purple",
    color: "#fff",
    count: 0,
  },
  h5: {
    elements: [],
    bg: "cyan",
    color: "#000",
    count: 0,
  },
  h6: {
    elements: [],
    bg: "black",
    color: "#fff",
    count: 0,
  },
};
const keyContainerId = "hheContainer";
const keyId = "hheKey";
const styleTagId = "hheStyleTag";
const r = (node) => node?.remove();
let headingsHighlighted = false;
window.highlightHeading = function () {
  if (!headingsHighlighted) {
    headingsHighlighted = true;
    init();
  } else {
    headingsHighlighted = false;
    resetDOM();
  }

  function init() {
    document.body.classList.add(className);
    initialiseHeadings();
    appendKeyToDOM();
    insertBadgeStyles();
  }

  function initialiseHeadings() {
    for (const h in headings) {
      headings[h].elements = [...document.body.querySelectorAll(h)];
      headings[h].count = headings[h].elements.length;
    }
  }

  function appendKeyToDOM() {
    const container = document.createElement("div");
    container.id = keyContainerId;
    container.innerHTML = `<div id="${keyId}">${createKey()}</div>`;
    document.body.appendChild(container);
  }

  function insertBadgeStyles() {
    document.head.appendChild(getStyles());
  }

  function getHeadingClassNames() {
    return Object.getOwnPropertyNames(headings).reduce((prev, curr) => {
      return (
        prev +
        `.${className} ${curr} { 
          outline: 3px solid ${headings[curr].bg} !important; 
       }`
      );
    }, "");
  }

  function getStyles() {
    const styleEl = document.createElement("style");
    styleEl.id = styleTagId;
    styleEl.innerHTML = `
    #${keyId} {
      background: #fff;
      border-radius: 4px;
      border: 1px solid #ccc;
      min-height: 16px;
      padding: 6px;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999999;
    }

    #${keyId} p {
        font-size: 20px;
        margin: 0;
        padding: 6px;
    }

    #${keyId}:hover {
      /** If you want to see something behind it **/
      opacity: 0.1;
    }

    ${getHeadingClassNames()}
  `;
    return styleEl;
  }

  function createKey() {
    return Object.getOwnPropertyNames(headings)
      .map(
        (h) =>
          `<p style="background-color: ${headings[h].bg}; color: ${headings[h].color}">Heading : ${h}, Count: ${headings[h].count}</p>`
      )
      .join("");
  }

  /*function hasExecuted() {
    const styles = document.querySelector(`#${styleTagId}`);
    const key = document.querySelector(`#${keyId}`);
    return Boolean(styles || key);
  }*/

  function resetDOM() {
    r(document.querySelector(`#${keyContainerId}`));
    r(document.querySelector(`#${styleTagId}`));
    document.body.classList.remove(className);
  }
};

browser.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.from === "popup" && msg.subject === "highlightHeading") {
    highlightHeading();
  }
});
