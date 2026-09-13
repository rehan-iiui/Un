const playerCardsElement = document.getElementById("playerCards");
const computerCardsElement = document.getElementById("computerCards");
const discardPileElement = document.getElementById("discardPile");
const drawButton = document.getElementById("drawButton");
const drawPile = document.getElementById("drawPile");
const unoButton = document.getElementById("unoButton");
const newGameButton = document.getElementById("newGameButton");
const turnMessage = document.getElementById("turnMessage");

const colorModal = document.getElementById("colorModal");
const winModal = document.getElementById("winModal");
const winTitle = document.getElementById("winTitle");
const winText = document.getElementById("winText");
const playAgainButton = document.getElementById("playAgainButton");

const playerScoreElement = document.getElementById("playerScore");
const computerScoreElement = document.getElementById("computerScore");

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];
let currentTurn = "player";
let currentColor = "";
let gameOver = false;
let playerSaidUno = false;

let playerScore = 0;
let computerScore = 0;

const colors = ["red", "yellow", "green", "blue"];

function createDeck() {
  const newDeck = [];

  colors.forEach(color => {
    newDeck.push({
      color,
      value: "0"
    });

    for (let i = 1; i <= 9; i++) {
      newDeck.push({ color, value: String(i) });
      newDeck.push({ color, value: String(i) });
    }

    for (let i = 0; i < 2; i++) {
      newDeck.push({ color, value: "skip" });
      newDeck.push({ color, value: "reverse" });
      newDeck.push({ color, value: "+2" });
    }
  });

  for (let i = 0; i < 4; i++) {
    newDeck.push({ color: "wild", value: "wild" });
    newDeck.push({ color: "wild", value: "+4" });
  }

  return newDeck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [array[i], array[randomIndex]] =
      [array[randomIndex], array[i]];
  }
}

function createGame() {
  deck = createDeck();
  shuffle(deck);

  playerHand = [];
  computerHand = [];
  discardPile = [];

  currentTurn = "player";
  currentColor = "";
  gameOver = false;
  playerSaidUno = false;

  for (let i = 0; i < 7; i++) {
    playerHand.push(drawCardFromDeck());
    computerHand.push(drawCardFromDeck());
  }

  let firstCard;

  do {
    firstCard = drawCardFromDeck();
  } while (firstCard.color === "wild");

  discardPile.push(firstCard);
  currentColor = firstCard.color;

  render();
}

function drawCardFromDeck() {
  if (deck.length === 0) {
    refillDeck();
  }

  return deck.pop();
}

function refillDeck() {
  if (discardPile.length <= 1) {
    return;
  }

  const topCard = discardPile.pop();

  deck = discardPile;
  discardPile = [topCard];

  shuffle(deck);
}

function getTopCard() {
  return discardPile[discardPile.length - 1];
}

function cardCanPlay(card) {
  const topCard = getTopCard();

  if (card.color === "wild") {
    return true;
  }

  if (card.color === currentColor) {
    return true;
  }

  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

function playPlayerCard(index) {
  if (gameOver || currentTurn !== "player") {
    return;
  }

  const card = playerHand[index];

  if (!cardCanPlay(card)) {
    turnMessage.textContent = "You can't play that card.";
    return;
  }

  playerHand.splice(index, 1);
  discardPile.push(card);

  if (playerHand.length === 1) {
    if (playerSaidUno) {
      turnMessage.textContent = "UNO! Good move!";
    } else {
      turnMessage.textContent = "Press UNO!";
    }
  }

  if (playerHand.length === 0) {
    finishGame("player");
    return;
  }

  playerSaidUno = false;

  if (card.color === "wild") {
    showColorChoice();
    return;
  }

  currentColor = card.color;

  applyCardEffect(card, "player");

  if (!gameOver) {
    currentTurn = "computer";
    render();
    setTimeout(computerTurn, 900);
  }
}

function applyCardEffect(card, playedBy) {
  if (card.value === "skip") {
    if (playedBy === "player") {
      currentTurn = "computer";
      setTimeout(computerTurn, 700);
    }
  }

  if (card.value === "reverse") {
    if (playedBy === "player") {
      currentTurn = "computer";
      setTimeout(computerTurn, 700);
    }
  }

  if (card.value === "+2") {
    if (playedBy === "player") {
      drawCardsForComputer(2);
    }
  }
}

function drawCardsForComputer(amount) {
  for (let i = 0; i < amount; i++) {
    computerHand.push(drawCardFromDeck());
  }
}

function drawCardsForPlayer(amount) {
  for (let i = 0; i < amount; i++) {
    playerHand.push(drawCardFromDeck());
  }
}

function playerDraw() {
  if (gameOver || currentTurn !== "player") {
    return;
  }

  const card = drawCardFromDeck();

  playerHand.push(card);

  turnMessage.textContent = "You drew a card.";

  if (cardCanPlay(card)) {
    turnMessage.textContent = "You can play the card you drew.";
  } else {
    currentTurn = "computer";
    render();

    setTimeout(computerTurn, 800);
    return;
  }

  render();
}

function computerTurn() {
  if (gameOver) {
    return;
  }

  currentTurn = "computer";
  turnMessage.textContent = "Computer's turn...";

  setTimeout(() => {
    let playableIndex = -1;

    for (let i = 0; i < computerHand.length; i++) {
      if (cardCanPlay(computerHand[i])) {
        playableIndex = i;
        break;
      }
    }

    if (playableIndex === -1) {
      computerHand.push(drawCardFromDeck());

      const drawnCard =
        computerHand[computerHand.length - 1];

      if (cardCanPlay(drawnCard)) {
        playableIndex = computerHand.length - 1;
      }
    }

    if (playableIndex === -1) {
      currentTurn = "player";
      turnMessage.textContent = "Your turn";
      render();
      return;
    }

    const card = computerHand.splice(playableIndex, 1)[0];

    discardPile.push(card);

    if (computerHand.length === 1) {
      turnMessage.textContent = "Computer has one card!";
    }

    if (computerHand.length === 0) {
      finishGame("computer");
      return;
    }

    if (card.color === "wild") {
      currentColor = chooseComputerColor();
    } else {
      currentColor = card.color;
    }

    if (card.value === "+2") {
      drawCardsForPlayer(2);
    }

    currentTurn = "player";
    turnMessage.textContent = "Your turn";

    render();
  }, 900);
}

function chooseComputerColor() {
  const counts = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0
  };

  computerHand.forEach(card => {
    if (counts[card.color] !== undefined) {
      counts[card.color]++;
    }
  });

  let bestColor = "red";

  colors.forEach(color => {
    if (counts[color] > counts[bestColor]) {
      bestColor = color;
    }
  });

  return bestColor;
}

function showColorChoice() {
  colorModal.classList.remove("hidden");
}

function chooseColor(color) {
  colorModal.classList.add("hidden");

  currentColor = color;
  currentTurn = "computer";

  render();

  setTimeout(computerTurn, 900);
}

function sayUno() {
  if (gameOver) {
    return;
  }

  if (playerHand.length === 1) {
    playerSaidUno = true;
    turnMessage.textContent = "UNO! 🎉";
  } else {
    turnMessage.textContent = "You can only call UNO with one card.";
  }
}

function finishGame(winner) {
  gameOver = true;

  if (winner === "player") {
    playerScore++;
    winTitle.textContent = "🎉 You Win!";
    winText.textContent = "You played all your cards!";
  } else {
    computerScore++;
    winTitle.textContent = "Computer Wins";
    winText.textContent = "The computer played all its cards.";
  }

  updateScore();

  setTimeout(() => {
    winModal.classList.remove("hidden");
  }, 300);
}

function updateScore() {
  playerScoreElement.textContent = playerScore;
  computerScoreElement.textContent = computerScore;
}

function createCardElement(card, hidden = false) {
  if (hidden) {
    const back = document.createElement("div");
    back.className = "back-card";
    back.textContent = "UNO";
    return back;
  }

  const cardElement = document.createElement("div");

  cardElement.className =
    `card ${card.color}`;

  let symbol = card.value;

  if (card.value === "skip") {
    symbol = "⊘";
  }

  if (card.value === "reverse") {
    symbol = "↔";
  }

  if (card.value === "+2") {
    symbol = "+2";
  }

  if (card.value === "wild") {
    symbol = "W";
  }

  if (card.value === "+4") {
    symbol = "+4";
  }

  const span = document.createElement("span");
  span.textContent = symbol;

  cardElement.appendChild(span);

  return cardElement;
}

function renderPlayerCards() {
  playerCardsElement.innerHTML = "";

  playerHand.forEach((card, index) => {
    const cardElement = createCardElement(card);

    cardElement.addEventListener("click", () => {
      playPlayerCard(index);
    });

    playerCardsElement.appendChild(cardElement);
  });
}

function renderComputerCards() {
  computerCardsElement.innerHTML = "";

  computerHand.forEach(() => {
    computerCardsElement.appendChild(
      createCardElement(null, true)
    );
  });
}

function renderDiscardPile() {
  discardPileElement.innerHTML = "";

  const topCard = getTopCard();

  if (!topCard) {
    return;
  }

  const cardElement = createCardElement(topCard);

  discardPileElement.appendChild(cardElement);
}

function render() {
  renderPlayerCards();
  renderComputerCards();
  renderDiscardPile();

  if (currentTurn === "player" && !gameOver) {
    turnMessage.textContent = "Your turn";
  }

  if (currentTurn === "computer" && !gameOver) {
    turnMessage.textContent = "Computer's turn...";
  }

  updateScore();
}

drawButton.addEventListener("click", playerDraw);

drawPile.addEventListener("click", playerDraw);

unoButton.addEventListener("click", sayUno);

newGameButton.addEventListener("click", createGame);

playAgainButton.addEventListener("click", () => {
  winModal.classList.add("hidden");
  createGame();
});

document.querySelectorAll(".choose-color").forEach(button => {
  button.addEventListener("click", () => {
    chooseColor(button.dataset.color);
  });
});

createGame();
```
