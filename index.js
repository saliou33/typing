import * as keyboard from "./keyboard.js";

const TEXT_LINE_CLASS = "textbox-line";
const TEXT_WORD_CLASS = "textbox-word";
const TEXT_CHAR_CLASS = "textbox-char";
const DEFAULT_TEXT =
  "Up branch to easily missed by do.\nAdmiration considered acceptance too led one melancholy expression.\nAre will took form the nor true. Winding enjoyed minuter her letters evident use eat colonel.\nHe attacks observe mr cottage inquiry am examine gravity. Are dear but near left was.\nYear kept on over so as this of. She steepest doubtful betrayed formerly him.\n\nActive one called uneasy our seeing see cousin tastes its. Ye am it formed indeed agreed relied piqued.";
const TEXT_KEY = "$33";

const BACKSPACE = "Backspace";
const SPACE = " ";
const SPACE_REG = /\s/g;
const SPACE_KEY = "˽";
const SPACE_KEY_REG = /(˽)/g;
const ENTER = "Enter";
const TAB = "Tab";
const TAB_KEY = "⇒";
const TAB_REG = /\s\s\s\s/g;
const ENTER_KEY = "↵";
const ENTER_KEY_REG = /(?<=↵)/g;
const NEXT_LINE_REG = /\n|\r\n/g;
const EMPTY = "";

const DOT = ".";
const CORRECT_CLASS = "correct";
const INCORRECT_CLASS = "incorrect";
const NEXT_CLASS = "next";

const NUM_LINES = 3;

const MILLISECONDS = 1000;
const DEFAULT_NS = 60;

const textboxElm = document.getElementById("textbox");
const timeElm = document.getElementById("time");
const accElm = document.getElementById("accuracy");
const scoreElm = document.getElementById("score");
const sliderCount = document.getElementById("slider-count");

let cursor = 0;
let size = 0;
let lineOffset = 0;
let pages = 0;
let currentText = DEFAULT_TEXT;
let content = [];
let max = 0;
let prevMax = 0;
let ns = 0;
let score = 0;
let accuracy = 0;
let interval = [];

// helper to create element
const createElement = (str, className) => {
  const node = document.createElement(str);
  if (className) {
    node.classList.add(className);
  }
  return node;
};

const updateView = (text, reset) => {
  // update stats using previous context
  updateStats(reset);

  // clear content
  cursor = 0;
  textboxElm.innerHTML = "";

  // prepare content
  if (text) {
    size = 0;
    lineOffset = 0;

    currentText = text
      .replace(NEXT_LINE_REG, ENTER_KEY)
      .replace(TAB_REG, TAB_KEY)
      .replace(SPACE_REG, SPACE_KEY);

    max = currentText.length;
    content = currentText.split(ENTER_KEY_REG);
    pages = Math.ceil(content.length / NUM_LINES);
  }

  // update slider count text
  sliderCount.innerHTML = `${Math.ceil(lineOffset / NUM_LINES) + 1}/${pages}`;

  // get lines
  const lines = content.slice(lineOffset, lineOffset + NUM_LINES);
  size = lines.join(EMPTY).length;

  // populate textbox
  let j = 0;
  for (let line of lines) {
    const lineElm = createElement("div", TEXT_LINE_CLASS);
    const words = line.split(SPACE_KEY_REG);
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

// update cursor with boundary check
const setCursor = (val) => {
  if (val >= 0 && val <= size) cursor = val;
};

// get key
const getKey = (key) => {
  return key == SPACE
    ? SPACE_KEY
    : key == ENTER
    ? ENTER_KEY
    : key == TAB
    ? TAB_KEY
    : key;
};

// key up
const handleKeyup = () => {};
// key down
const handleKeydown = (e) => {
  e.preventDefault();
  let key = getKey(e.key);

  const elm = document.getElementById(cursor);

  // handle class change and cursor
  if (key === BACKSPACE) {
    const prevElm = document.getElementById(cursor - 1 >= 0 ? cursor - 1 : 0);
    prevElm.classList.remove(CORRECT_CLASS);
    prevElm.classList.remove(INCORRECT_CLASS);
    elm.classList.remove(NEXT_CLASS);
    setCursor(cursor - 1);
    prevElm.classList.add(NEXT_CLASS);
  } else if (key.length == 1) {
    //
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

  // if all chars in current line offset have been typed
  if (cursor === size) {
    slideRight();
  }
};

//file import

const input = document.getElementById("file");
const reader = new FileReader();
input.onchange = () => {
  const file = input.files[0];
  reader.readAsText(file);
  reader.onload = () => {
    if (reader.result) {
      saveText(reader.result);
      updateView(reader.result);
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
  navigator.clipboard.readText().then((text) => {
    saveText(text);
    updateView(text);
  });
};
document.getElementById("paste").onclick = handlePaste;

//reset everything
const handleReset = () => {
  saveText(DEFAULT_TEXT);
  updateView(DEFAULT_TEXT, true);
};
document.getElementById("reset").onclick = handleReset;

//restart
const handleRestart = () => {
  let text = getText();
  if (!text) text = currentText;
  updateView(text);
};
document.getElementById("restart").onclick = handleReset;

//save text to storage
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

//slider
const slideLeft = () => {
  lineOffset = lineOffset > 0 ? lineOffset - NUM_LINES : 0;
  max = prevMax;
  if (lineOffset === 0) {
    handleRestart();
    return;
  }
  updateView();
};
document.getElementById("slider-left").onclick = slideLeft;
const slideRight = () => {
  lineOffset += NUM_LINES;

  prevMax = max;
  max = max - size;

  if (max === 0) {
    handleRestart();
    return;
  }
  updateView();
};
document.getElementById("slider-right").onclick = slideRight;
// default mode
handleRestart();
// key listener
keyboard.listenKey(handleKeydown, handleKeyup);
