import inputs from "./qwerty.json" assert { type: "json" };

const KEYBOARD_ROW_CLASS = "keyboard-row";
const KEYBOARD_INPUT_CLASS = "keyboard-input";
const CODE_SHIFT = /(ShiftLeft)|(ShiftRight)/g;
const ACTIVE = "active";
const SPACE = " ";
const EMPTY = "";

export const fillKeyboard = (shift) => {
  const keyboardElm = document.getElementById("keyboard");
  keyboardElm.innerHTML = "";

  for (let line of inputs) {
    let rowElm = document.createElement("div");
    rowElm.classList.add(KEYBOARD_ROW_CLASS);

    for (let [key, value] of Object.entries(line)) {
      let keyElm = document.createElement("p");
      let keyText = "";
      keyElm.classList.add(KEYBOARD_INPUT_CLASS);
      keyElm.setAttribute("id", value);

      if (shift) {
        keyText = key.split(SPACE).pop();
        if (keyText.length === 1) {
          keyText = keyText.toUpperCase();
        }
      } else {
        keyText = key.split(SPACE).shift();
      }

      keyElm.innerHTML = keyText;
      rowElm.appendChild(keyElm);
    }

    keyboardElm.appendChild(rowElm);
  }
};

export const listenKey = (handleKeydown, handleKeyup) => {
  if (handleKeydown) {
    document.addEventListener("keydown", (e) => {
      if (e.code.match(CODE_SHIFT)) {
        fillKeyboard(true);
      }
      document.getElementById(e.code)?.classList.add(ACTIVE);

      handleKeydown(e);
    });
  }

  if (handleKeyup) {
    document.addEventListener("keyup", (e) => {
      if (e.code.match(CODE_SHIFT)) {
        fillKeyboard();
      }
      document.getElementById(e.code)?.classList.remove(ACTIVE);
      handleKeyup(e);
    });
  }
};

fillKeyboard();
