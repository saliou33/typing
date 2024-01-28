import * as keyboard from "./keyboard.js";
import ex from "./default.json" assert { type: "json" };

const TEXT_LINE_CLASS = "textbox-line";
const TEXT_WORD_CLASS = "textbox-word";
const TEXT_CHAR_CLASS = "textbox-char";
const DEFAULT_TEXT = ex.TEXT;
const TEXT_KEY = "$33";

const BACKSPACE = "Backspace";
const SPACE = " ";
const SPACE_KEY = "˽";
const ENTER = "Enter";
const ENTER_KEY = "↵";
const WHITE_SPACE = /(\s+)/;
const NEXT_LINE = /\n/;
const EMPTY = "";

const DOT = ".";
const CORRECT_CLASS = "correct";
const INCORRECT_CLASS = "incorrect";
const NEXT_CLASS = "next";

const NUM_LINES = 3;

const MILLISECONDS = 1000;
const DEFAULT_NS = 60;

document.body.onload = () => {
  const textboxElm = document.getElementById("textbox");
  const timeElm = document.getElementById("time");
  const accElm = document.getElementById("accuracy");
  const scoreElm = document.getElementById("score");

  let cursor = 0;
  let size = 0;
  let lineOffset = 0;
  let currentText = "";
  let allText = [];
  let max = 0;
  let ns = 0;
  let score = 0;
  let accuracy = 0;
  let interval = [];

  const createElement = (str, className) => {
    const node = document.createElement(str);
    if (className) {
      node.classList.add(className);
    }
    return node;
  };

  const updateView = (text, resetStats) => {
    // reset stats if text is passed
    updateStats(resetStats);

    cursor = 0;
    textboxElm.innerHTML = "";

    if (text) {
      currentText = text;
      allText = currentText.split(NEXT_LINE);
      max = text.length + 1;
      size = 0;
      lineOffset = 0;
    }

    let j = 0;

    const lines = allText.slice(lineOffset, lineOffset + NUM_LINES);
    size = lines.join(EMPTY).length + lines.length;

    for (let line of lines) {
      const lineElm = createElement("div", TEXT_LINE_CLASS);

      const words = line
        .split(WHITE_SPACE)
        .map((w) => (w === SPACE ? SPACE_KEY : w));

      words.push(ENTER_KEY);
      for (let word of words) {
        const wordElm = createElement("div", TEXT_WORD_CLASS);

        const chars = word.split(EMPTY);
        for (let char of chars) {
          const elm = createElement("span", TEXT_CHAR_CLASS);
          elm.innerText = char;
          elm.setAttribute("id", j);
          wordElm.appendChild(elm);
          j++;
        }

        lineElm.appendChild(wordElm);
      }
      textboxElm.appendChild(lineElm);
    }
  };

  const setCursor = (val) => {
    if (val >= 0 && val <= size) {
      cursor = val;
    }
  };

  // key listener
  const handleKeydown = (e) => {
    e.preventDefault();
    let key = e.key;
    const elm = document.getElementById(cursor < size ? cursor : size - 1);

    // handle class change and cursor
    if (key === BACKSPACE) {
      const prevElm = document.getElementById(cursor - 1 >= 0 ? cursor - 1 : 0);
      prevElm.classList.remove(CORRECT_CLASS);
      prevElm.classList.remove(INCORRECT_CLASS);
      elm.classList.remove(NEXT_CLASS);
      setCursor(cursor - 1);
      prevElm.classList.add(NEXT_CLASS);
    } else if (key.length === 1 || key === ENTER || key === SPACE) {
      key = key === SPACE ? SPACE_KEY : key == ENTER ? ENTER_KEY : key;

      if (key === elm.innerText) {
        elm.classList.add(CORRECT_CLASS);
      } else {
        elm.classList.add(INCORRECT_CLASS);
      }
      elm.classList.remove(NEXT_CLASS);
      setCursor(cursor + 1);
      if (cursor < size) {
        document.getElementById(cursor).classList.add(NEXT_CLASS);
      }
    }

    // if all chars in current offset have been typed
    if (cursor === size) {
      lineOffset += NUM_LINES;
      cursor = 0;
      max -= size;
      if (max === 0) {
        lineOffset = 0;
      }
      updateView();
    }
  };
  const handleKeyup = () => {};

  //file import
  const fileInput = document.getElementById("file");
  const fileReader = new FileReader();
  fileInput.onchange = () => {
    const selectedFile = fileInput.files[0];
    fileReader.readAsText(selectedFile);
    fileReader.onload = () => {
      let s = fileReader.result.replace(/\r\n/g, "\n");
      if (fileReader.result) {
        updateView(s);
      }
    };
  };

  // clear typed
  const handleClear = () => {
    updateView();
  };
  document.getElementById("clear").onclick = handleClear;

  //paste from clipboard
  const handlePaste = () => {
    navigator.clipboard.readText().then((s) => {
      updateView(s);
    });
  };
  document.getElementById("paste").onclick = handlePaste;

  //reset to default text
  const handleReset = () => {
    updateView(DEFAULT_TEXT, true);
  };
  document.getElementById("reset").onclick = handleReset;

  //restart
  const handleRestart = () => {
    let text = getText();
    if (!text) text = DEFAULT_TEXT;
    updateView(text);
  };
  document.getElementById("restart").onclick = handleReset;

  //saveText to storage
  const saveText = (text) => {
    if (text) {
      localStorage.setItem(TEXT_KEY, text);
      return;
    }
    localStorage.setItem(TEXT_KEY, currentText);
  };

  // get text from storage
  const getText = () => {
    return localStorage.getItem(TEXT_KEY);
  };

  // update statistics
  const updateStats = (reset) => {
    clearInterval(interval.shift());

    if (reset) {
      accuracy = 0;
      score = 0;
    } else {
      const ncorr = document.querySelectorAll(DOT + CORRECT_CLASS).length;
      accuracy = Math.floor((ncorr * 100) / (size + 1));
      score += Math.round((accuracy * ns) / DEFAULT_NS);
    }

    accElm.innerText = accuracy + "%";
    scoreElm.innerText = score;
    ns = DEFAULT_NS;
    timeElm.innerText = ns + "s";

    interval.push(
      setInterval(() => {
        timeElm.innerText = --ns + "s";
        if (ns == 0) {
          clearInterval(interval.shift());
        }
      }, MILLISECONDS)
    );
  };

  // default mode
  handleRestart();
  // key listener
  keyboard.listenKey(handleKeydown, handleKeyup);
  // save text
  window.onbeforeunload = () => {
    saveText();
  };
};
