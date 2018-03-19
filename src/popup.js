let clown = document.getElementById('clown')

clown.addEventListener("click", (e) => {
  browser.runtime.sendMessage({
    command: "newTheme",
  });
});

let undo = document.getElementById('undo')

undo.addEventListener("click", (e) => {
  browser.runtime.sendMessage({
    command: "undoTheme",
  });
});
