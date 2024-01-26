import * as keyboard from "./keyboard.js";

const TEXT_LINE = "textbox-line";
const TEXT_WORD = "textbox-word";
const TEXT_CHAR = "textbox-char";

const BACKSPACE = "Backspace";
const SPACE = " ";
const SPACE_KEY = "˽";
const ENTER = "Enter";
const ENTER_KEY = "↵";
const WHITE_SPACE = /(\s+)/;
const NEXT_LINE = /\n/;
const EMPTY = "";

const CORRECT = "correct";
const INCORRECT = "incorrect";
const NEXT = "next";

const defaultText = `Up branch to easily missed by do.
Admiration considered acceptance too led one melancholy expression.
Are will took form the nor true. Winding enjoyed minuter her letters evident use eat colonel.
He attacks observe mr cottage inquiry am examine gravity. Are dear but near left was.
Year kept on over so as this of. She steepest doubtful betrayed formerly him.
Active one called uneasy our seeing see cousin tastes its. Ye am it formed indeed agreed relied piqued.`;

let cursor = 0;
let size = 0;

document.body.onload = () => {
  const textboxElm = document.querySelector(".textbox");

  const createElement = (str, className) => {
    const node = document.createElement(str);
    if (className) {
      node.classList.add(className);
    }
    return node;
  };

  const fillTextBox = (text) => {
    textboxElm.innerHTML = "";
    size = text.split(EMPTY).length;

    let j = 0;
    const lines = text.split(NEXT_LINE);
    for (let line of lines) {
      const lineElm = createElement("div", TEXT_LINE);

      const words = line
        .split(WHITE_SPACE)
        .map((w) => (w == SPACE ? SPACE_KEY : w));

      words.push(ENTER_KEY);
      for (let word of words) {
        const wordElm = createElement("div", TEXT_WORD);

        const chars = word.split(EMPTY);
        for (let char of chars) {
          const elm = createElement("span", TEXT_CHAR);
          elm.innerText = char;
          elm.setAttribute("id", j);
          wordElm.appendChild(elm);
          j++;
        }
        lineElm.appendChild(wordElm);
      }
      textboxElm.appendChild(lineElm);
    }

    // document.getElementById(cursor).classList.add(NEXT);
  };

  const setCursor = (val) => {
    if (val >= 0 && val < size) {
      cursor = val;
    }
  };

  const handleKeydown = (e) => {
    e.preventDefault();
    let key = e.key;
    const elm = document.getElementById(cursor);

    if (key === BACKSPACE) {
      if (cursor >= 0) {
        const prevElm = document.getElementById(cursor - 1 ? cursor - 1 : 0);
        prevElm.classList.remove(CORRECT);
        prevElm.classList.remove(INCORRECT);
        elm.classList.remove(NEXT);
        setCursor(cursor - 1);
        prevElm.classList.add(NEXT);
      }
    } else if (key.length === 1 || key === ENTER || key === SPACE) {
      key = key === SPACE ? SPACE_KEY : key == ENTER ? ENTER_KEY : key;

      if (key === elm.innerText) {
        elm.classList.add(CORRECT);
      } else {
        elm.classList.add(INCORRECT);
      }
      elm.classList.remove(NEXT);
      setCursor(cursor + 1);
      document.getElementById(cursor).classList.add(NEXT);
    }
  };

  fillTextBox(defaultText);
  keyboard.listenKey(handleKeydown);
};
