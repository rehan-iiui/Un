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

/* =========================
   CREATE DECK
========================= */

function createDeck() {
  const newDeck = [];

  colors.forEach(color => {

    // One zero
    newDeck.push({
      color: color,
      value: "0"
    });

    // Two of each 1-9
    for (let number = 1; number <= 9; number++) {
      newDeck.push({
        color: color,
        value: String(number)
      });

      newDeck.push({
        color: color,
        value: String(number)
      });
    }

    // Two special cards of each type
    for (let i = 0; i < 2; i++) {

      newDeck.push({
        color: color,
        value: "skip"
      });

      newDeck.push({
        color: color,
        value: "reverse"
      });

      newDeck.push({
        color: color,
        value: "+2"
      });
    }
  });

  // Wild cards
  for (let i = 0; i < 4; i++) {

    newDeck.push({
      color: "wild",
      value: "wild"
    });

    newDeck.push({
      color: "wild",
      value: "+4"
    });
  }

  return newDeck;
}

/* =========================
   SHUFFLE
========================= */

function shuffle(array) {

  for (let i = array.length - 1; i > 0; i--) {

    const randomIndex =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[randomIndex]] =
      [array[randomIndex], array[i]];
  }
}

/* =========================
   START GAME
========================= */

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

  colorModal.classList.add("hidden");
  winModal.classList.add("hidden");

  // Deal 7 cards each
  for (let i = 0; i < 7; i++) {

    playerHand.push(drawCardFromDeck());
    computerHand.push(drawCardFromDeck());
  }

  // First discard card
  let firstCard;

  do {
    firstCard = drawCardFromDeck();
  } while (firstCard.color === "wild");

  discardPile.push(firstCard);

  currentColor = firstCard.color;

  render();

  turnMessage.textContent = "Your turn";
}

/* =========================
   DRAW CARD
========================= */

function drawCardFromDeck() {

  if (deck.length === 0) {
    refillDeck();
  }

  return deck.pop();
}

/* =========================
   REFILL DECK
========================= */

function refillDeck() {

  if (discardPile.length <= 1) {
    return;
  }

  const topCard = discardPile.pop();

  deck = discardPile;

  discardPile = [topCard];

  shuffle(deck);
}

/* =========================
   TOP CARD
========================= */

function getTopCard() {
  return discardPile[discardPile.length - 1];
}

/* =========================
   CAN PLAY CARD?
========================= */

function cardCanPlay(card) {

  const topCard = getTopCard();

  // Wild cards can normally be played
  if (card.color === "wild") {
    return true;
  }

  // Same color
  if (card.color === currentColor) {
    return true;
  }

  // Same value
  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

/* =========================
   PLAYER PLAYS CARD
========================= */

function playPlayerCard(index) {

  if (gameOver || currentTurn !== "player") {
    return;
  }

  const card = playerHand[index];

  if (!cardCanPlay(card)) {

    turnMessage.textContent =
      "You can't play that card.";

    return;
  }

  playerHand.splice(index, 1);

  discardPile.push(card);

  playerSaidUno = false;

  // Player has won
  if (playerHand.length === 0) {

    finishGame("player");

    return;
  }

  // Player has one card
  if (playerHand.length === 1) {

    if (!playerSaidUno) {
      turnMessage.textContent =
        "You have one card! Press UNO!";
    }
  }

  // Wild card
  if (card.color === "wild") {

    if (card.value === "+4") {

      showColorChoice("plus4");

    } else {

      showColorChoice("wild");
    }

    return;
  }

  currentColor = card.color;

  handleSpecialCard(card, "player");
}

/* =========================
   SPECIAL CARD LOGIC
========================= */

function handleSpecialCard(card, owner) {

  if (card.value === "skip") {

    turnMessage.textContent =
      owner === "player"
        ? "Skip! Computer loses its turn."
        : "Computer played Skip!";

    if (owner === "player") {

      render();

      setTimeout(() => {
        currentTurn = "player";
        turnMessage.textContent = "Your turn";
        render();
      }, 900);

    } else {

      currentTurn = "player";

      render();
    }

    return;
  }

  if (card.value === "reverse") {

    turnMessage.textContent =
      "Reverse!";

    if (owner === "player") {

      render();

      setTimeout(() => {
        currentTurn = "computer";
        render();
        computerTurn();
      }, 700);

    } else {

      currentTurn = "player";

      render();
    }

    return;
  }

  if (card.value === "+2") {

    if (owner === "player") {

      drawCardsForComputer(2);

      turnMessage.textContent =
        "Computer draws 2 cards!";

      render();

      setTimeout(() => {

        currentTurn = "player";

        turnMessage.textContent =
          "Your turn";

        render();

      }, 1000);

    } else {

      drawCardsForPlayer(2);

      turnMessage.textContent =
        "You draw 2 cards!";

      currentTurn = "player";

      render();
    }

    return;
  }

  // Normal card
  if (owner === "player") {

    currentTurn = "computer";

    render();

    setTimeout(computerTurn, 800);

  } else {

    currentTurn = "player";

    render();
  }
}

/* =========================
   WILD COLOR SELECTION
========================= */

let pendingWildType = "wild";

function showColorChoice(type) {

  pendingWildType = type;

  colorModal.classList.remove("hidden");
}

/* =========================
   CHOOSE WILD COLOR
========================= */

function chooseColor(color) {

  colorModal.classList.add("hidden");

  currentColor = color;

  // +4
  if (pendingWildType === "plus4") {

    drawCardsForComputer(4);

    turnMessage.textContent =
      `Computer draws 4 cards! ${capitalize(color)} selected.`;

    render();

    setTimeout(() => {

      currentTurn = "player";

      turnMessage.textContent =
        "Your turn";

      render();

    }, 1200);

    return;
  }

  // Normal Wild
  turnMessage.textContent =
    `${capitalize(color)} selected.`;

  currentTurn = "computer";

  render();

  setTimeout(computerTurn, 900);
}

/* =========================
   DRAW FOR PLAYER
========================= */

function drawCardsForPlayer(amount) {

  for (let i = 0; i < amount; i++) {
    playerHand.push(drawCardFromDeck());
  }
}

/* =========================
   DRAW FOR COMPUTER
========================= */

function drawCardsForComputer(amount) {

  for (let i = 0; i < amount; i++) {
    computerHand.push(drawCardFromDeck());
  }
}

/* =========================
   PLAYER DRAWS
========================= */

function playerDraw() {

  if (gameOver || currentTurn !== "player") {
    return;
  }

  const card = drawCardFromDeck();

  playerHand.push(card);

  turnMessage.textContent =
    "You drew a card.";

  render();

  // If the card can be played,
  // allow the player to decide.
  if (cardCanPlay(card)) {

    turnMessage.textContent =
      "You can play the card you drew.";

    return;
  }

  currentTurn = "computer";

  render();

  setTimeout(computerTurn, 900);
}

/* =========================
   COMPUTER TURN
========================= */

function computerTurn() {

  if (gameOver) {
    return;
  }

  if (currentTurn !== "computer") {
    return;
  }

  turnMessage.textContent =
    "Computer's turn...";

  render();

  setTimeout(() => {

    let playableIndex = -1;

    // Find a playable card
    for (let i = 0; i < computerHand.length; i++) {

      if (cardCanPlay(computerHand[i])) {

        playableIndex = i;

        break;
      }
    }

    // Draw if no playable card
    if (playableIndex === -1) {

      computerHand.push(drawCardFromDeck());

      const drawnCard =
        computerHand[computerHand.length - 1];

      if (cardCanPlay(drawnCard)) {

        playableIndex =
          computerHand.length - 1;

      }
    }

    // Still can't play
    if (playableIndex === -1) {

      currentTurn = "player";

      turnMessage.textContent =
        "Your turn";

      render();

      return;
    }

    const card =
      computerHand.splice(playableIndex, 1)[0];

    discardPile.push(card);

    // Computer wins
    if (computerHand.length === 0) {

      finishGame("computer");

      return;
    }

    // Computer has one card
    if (computerHand.length === 1) {

      turnMessage.textContent =
        "Computer says UNO!";
    }

    // Wild
    if (card.color === "wild") {

      currentColor =
        chooseComputerColor();

      if (card.value === "+4") {

        drawCardsForPlayer(4);

        turnMessage.textContent =
          `Computer played +4. You draw 4!`;

        currentTurn = "player";

        render();

        return;
      }

      turnMessage.textContent =
        `Computer chose ${capitalize(currentColor)}.`;

      currentTurn = "player";

      render();

      return;
    }

    currentColor = card.color;

    // Special cards
    if (card.value === "skip") {

      turnMessage.textContent =
        "Computer played Skip!";

      currentTurn = "player";

      render();

      return;
    }

    if (card.value === "reverse") {

      turnMessage.textContent =
        "Computer played Reverse!";

      currentTurn = "player";

      render();

      return;
    }

    if (card.value === "+2") {

      drawCardsForPlayer(2);

      turnMessage.textContent =
        "Computer played +2. You draw 2!";

      currentTurn = "player";

      render();

      return;
    }

    // Normal card
    currentTurn = "player";

    turnMessage.textContent =
      "Your turn";

    render();

  }, 900);
}

/* =========================
   COMPUTER CHOOSES COLOR
========================= */

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

  let bestColor = colors[0];

  colors.forEach(color => {

    if (counts[color] > counts[bestColor]) {
      bestColor = color;
    }
  });

  return bestColor;
}

/* =========================
   UNO BUTTON
========================= */

function sayUno() {

  if (gameOver) {
    return;
  }

  if (playerHand.length === 1) {

    playerSaidUno = true;

    turnMessage.textContent =
      "UNO! 🎉";

  } else {

    turnMessage.textContent =
      "You can call UNO when you have one card.";
  }
}

/* =========================
   WINNER
========================= */

function finishGame(winner) {

  gameOver = true;

  if (winner === "player") {

    playerScore++;

    winTitle.textContent =
      "🎉 You Win!";

    winText.textContent =
      "You played all your cards!";

  } else {

    computerScore++;

    winTitle.textContent =
      "Computer Wins";

    winText.textContent =
      "The computer played all its cards.";
  }

  updateScore();

  setTimeout(() => {
    winModal.classList.remove("hidden");
  }, 300);
}

/* =========================
   SCORE
========================= */

function updateScore() {

  playerScoreElement.textContent =
    playerScore;

  computerScoreElement.textContent =
    computerScore;
}

/* =========================
   CARD DISPLAY
========================= */

function createCardElement(card, hidden = false) {

  if (hidden) {

    const back =
      document.createElement("div");

    back.className =
      "back-card";

    back.textContent =
      "UNO";

    return back;
  }

  const cardElement =
    document.createElement("div");

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

  const span =
    document.createElement("span");

  span.textContent = symbol;

  cardElement.appendChild(span);

  return cardElement;
}

/* =========================
   RENDER PLAYER
========================= */

function renderPlayerCards() {

  playerCardsElement.innerHTML = "";

  playerHand.forEach((card, index) => {

    const cardElement =
      createCardElement(card);

    cardElement.addEventListener(
      "click",
      () => playPlayerCard(index)
    );

    playerCardsElement.appendChild(
      cardElement
    );
  });
}

/* =========================
   RENDER COMPUTER
========================= */

function renderComputerCards() {

  computerCardsElement.innerHTML = "";

  computerHand.forEach(() => {

    computerCardsElement.appendChild(
      createCardElement(null, true)
    );
  });
}

/* =========================
   RENDER DISCARD
========================= */

function renderDiscardPile() {

  discardPileElement.innerHTML = "";

  const topCard = getTopCard();

  if (!topCard) {
    return;
  }

  const cardElement =
    createCardElement(topCard);

  discardPileElement.appendChild(
    cardElement
  );
}

/* =========================
   RENDER EVERYTHING
========================= */

function render() {

  renderPlayerCards();

  renderComputerCards();

  renderDiscardPile();

  updateScore();

  if (
    currentTurn === "player" &&
    !gameOver
  ) {
    if (playerHand.length !== 1) {
      turnMessage.textContent =
        "Your turn";
    }
  }

  if (
    currentTurn === "computer" &&
    !gameOver
  ) {
    turnMessage.textContent =
      "Computer's turn...";
  }
}

/* =========================
   CAPITALIZE
========================= */

function capitalize(text) {

  return text.charAt(0).toUpperCase()
    + text.slice(1);
}

/* =========================
   BUTTONS
========================= */

drawButton.addEventListener(
  "click",
  playerDraw
);

drawPile.addEventListener(
  "click",
  playerDraw
);

unoButton.addEventListener(
  "click",
  sayUno
);

newGameButton.addEventListener(
  "click",
  createGame
);

playAgainButton.addEventListener(
  "click",
  () => {

    winModal.classList.add("hidden");

    createGame();
  }
);

/* =========================
   COLOR BUTTONS
========================= */

document
  .querySelectorAll(".choose-color")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        chooseColor(
          button.dataset.color
        );
      }
    );
  });

/* =========================
   START
========================= */

createGame();
```
