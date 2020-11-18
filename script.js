const wordEl = document.getElementById("word");
const wrongLettersEl = document.getElementById("wrong-letters");
const playAgainBtn = document.getElementById("play-button");
const popup = document.getElementById("popup-container");
const initialPopup = document.getElementById("initial-popup");
const finalPopup = document.getElementById("final-popup");
const notification = document.getElementById("notification-container");
const finalMessage = document.getElementById("final-message");
const startBtn = document.getElementById("start-button");
const figureParts = document.querySelectorAll(".figure-part");
const hintBtn = document.getElementById("hint-button");
const hintCounter = document.getElementById("hint-counter");
const score = document.getElementById("score");
const totalScore = document.getElementById("total-score");
const hearts = document.getElementById("hearts-container");
const loader = document.getElementById("loader");
let selectedWord = "";
const correctLetters = [];
const wrongLetters = [];
function initialInstructions() {
  popup.style.display = "flex";
  finalPopup.style.display = "none";
}
function startGame() {
  popup.style.display = "none";
  getWords();
}
async function getWords() {
  loader.classList.add("lds-facebook");
  let englishWord = "";
  let hebWord = "";
  try {
    let response = await fetch(
      "https://wordsapiv1.p.rapidapi.com/words/?random=true&frequencymin=6.8",
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
          "x-rapidapi-key":
            "13360eddb0mshcfe9e2e2d4733f7p1bb8b8jsn0e70dc1e4523",
        },
      }
    );

    let data = await response.json();
    englishWord = data.word;
    console.log(response);
    //check if english word contains special characters
    if (
      englishWord.split(" ").length > 1 ||
      englishWord.split("-").length > 1 ||
      englishWord.split("#").length > 1 ||
      englishWord.split("־").length > 1
    ) {
      getWords();
    } else {
      response = await fetch(
        `https://api.mymemory.translated.net/get?q=${englishWord}&langpair=en|he&key=43a32cf91bd314360bee&de=hannanel100@gmail.com`
      );
      data = await response.json();
      //check if word was translated
      console.log(data);
      if (data.matches[0].segment === data.matches[0].translation) {
        getWords();
      } else {
        hebWord = data.responseData.translatedText;
        selectedWord = hebWord.split(" ")[0];
        loader.classList.remove("lds-facebook");
        displayWord();
      }
    }
  } catch (error) {
    console.error(error);
  }
}
//Show hidden word
function displayWord() {
  console.log(selectedWord);
  wordEl.innerHTML = `
    ${selectedWord
      .split("")
      .map(
        (letter) =>
          `<span class="letter"> 
          ${correctLetters.includes(letter) ? letter : ""}
           </span>`
      )
      .join("")}
    `;
  const innerWord = wordEl.innerText.replace(/\n/g, "");
  if (innerWord === selectedWord) {
    finalMessage.innerText = ` מזל טוב! ניצחתם! קיבלתם: ${score.innerText}`;
    popup.style.display = "flex";
    initialPopup.style.display = "none";
    finalPopup.style.display = "flex";
  }
}

//Update the wrong letters
function updateWrongLettersEl() {
  wrongLettersEl.innerHTML = `
  ${wrongLetters.length > 0 ? "<p>טעות</p>" : ""}
  ${wrongLetters.map((letter) => `<span>${letter}</span>`)}`;
  figureParts.forEach((part, index) => {
    const errors = wrongLetters.length;

    if (index < errors) {
      part.style.display = "block";
    } else {
      part.style.display = "none";
    }
  });
  if (wrongLetters.length === figureParts.length) {
    finalMessage.innerText = "לצערנו, הפסדתם...";
    document.addEventListener("keydown", (e) => resetGame(e));
    popup.style.display = "flex";
  }
}
function showNotification() {
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}
function resetGame(event) {
  //Empty arrays
  correctLetters.splice(0);
  wrongLetters.splice(0);
  hintCounter.innerText = "3";
  hintCounter.classList.remove("last-try");
  updateWrongLettersEl();
  wordEl.innerHTML = "";
  updateTotalScore();
  score.innerText = 100;
  getWords();

  popup.style.display = "none";
}

function giveHint() {
  if (hintCounter.innerText > 0) {
    const letterPicked =
      selectedWord[Math.floor(Math.random() * selectedWord.length)];
    if (!correctLetters.includes(letterPicked)) {
      correctLetters.push(letterPicked);
      hintCounter.innerText--;
      updateHearts();
      updateScore("hint");
      if (hintCounter.innerText == 1) {
        hintCounter.classList.add("last-try");
      }
      displayWord();
    } else {
      giveHint();
    }
  }
}
function updateHearts() {
  if (hearts.dataset.heartCounter > 0) {
    hearts.dataset.heartCounter--;
    let heartsIcons = "";
    for (let index = 0; index < hearts.dataset.heartCounter; index++) {
      heartsIcons += `<i class="fas fa-heart"></i>`;
    }
    console.log(heartsIcons);
    hearts.innerHTML = `<div class="row">${heartsIcons}</div>`;
  }
}
//Update score
function updateScore(caller) {
  if (caller === "hint") {
    score.innerText -= 10;
  } else if (caller === "wrong") {
    score.innerText -= 5;
  }
}

//update total score
function updateTotalScore() {
  let total = Number(totalScore.innerText);
  const currentScore = Number(score.innerText);
  total += currentScore;
  totalScore.innerText = total;
}
//Keydown letter press
window.addEventListener("keydown", (e) => {
  console.log(e.code, e.key, e.keyCode);
  if (
    e.keyCode === 188 ||
    e.keyCode === 186 ||
    e.keyCode === 190 ||
    (e.keyCode >= 65 && e.keyCode <= 90 && e.keyCode !== 81 && e.keyCode !== 87)
  ) {
    const letter = e.key;
    if (selectedWord.includes(letter)) {
      if (!correctLetters.includes(letter)) {
        correctLetters.push(letter);
        displayWord();
      } else {
        showNotification();
      }
    } else {
      if (!wrongLetters.includes(letter)) {
        wrongLetters.push(letter);
        updateWrongLettersEl();
        updateScore("wrong");
      } else {
        showNotification();
      }
    }
  } else if (e.keyCode === 13) {
    const innerWord = wordEl.innerText.replace(/\n/g, "");
    if (innerWord === selectedWord) {
      resetGame(e);
    } else if (totalScore.innerText == 0) {
      startGame();
    }
  }
});
//give a hint
hintBtn.addEventListener("click", giveHint);
//Restart game and play again
playAgainBtn.addEventListener("click", (e) => resetGame(e));
initialInstructions();
startBtn.addEventListener("click", startGame);
