import inputs from "./qwerty.json" assert { type: "json" };

const keyboardElm = document.querySelector(".keyboard");

for (let line of inputs) {
  let rowElm = document.createElement("div");
  rowElm.classList.add("keyboard-row");

  for (let [key, value] of Object.entries(line)) {
    let keyElm = document.createElement("p");
    keyElm.classList.add("keyboard-input");
    keyElm.innerHTML = key;
    rowElm.appendChild(keyElm);
  }

  keyboardElm.appendChild(rowElm);
}

export function listenKey(handleKeydown, hanleKeyup) {
  if (handleKeydown) {
    document.addEventListener("keydown", handleKeydown);
  }

  if (hanleKeyup) {
    document.addEventListener("keyup", hanleKeyup);
  }
}
