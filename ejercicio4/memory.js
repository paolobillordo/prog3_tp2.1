class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }

    toggleFlip() {
        if (this.isFlipped) {
            this.isFlipped = false
            this.#unflip()            
        } else {
            this.isFlipped = true
            this.#flip()
        }
    }

    matches(otherCard) {
        if (this.name === otherCard.name) {
            return true
        } else {
            return false
        }
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }

    shuffleCards() {
        let cards = this.cards
        for (let i = cards.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];            
        }
        return cards
    }

    flipDownAllCards() {
        let cards = this.cards
        cards.forEach(card => {
            card.isFlipped = true
            card.toggleFlip()           
        });
    }

    reset() {
        this.flipDownAllCards();
        this.shuffleCards()       
        this.render()
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.count = 0;
        this.points = 0;
        this.maxPoints = 10000;
        this.pointsElement = document.getElementById('points');
        this.timerElement = document.getElementById('time');
        this.time = 0;
        this.timerInterval = null;
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        let cards = this.flippedCards;
        if (cards[0].matches(cards[1])) {
            this.pointsEarned();
            this.matchedCards.push(cards[0]);
            this.matchedCards.push(cards[1]);            
            if (this.matchedCards.length === 12) {
                this.stopTime()
                this.pointsElement.textContent = `Termino el juego, hiciste ${this.points} puntos en ${this.count} intentos`;
                this.maxPoints = 10000;
            }           
        } else {
            cards[0].toggleFlip()
            cards[1].toggleFlip()
        }
        this.flippedCards = [];
        this.count += 1;
        if (this.matchedCards.length < 12) {
            this.pointsElement.textContent = `Intentos: ${this.count} Puntos: ${this.points}`;            
        }
    }

    startTime() {
        return new Promise((resolve) => {
            this.timerInterval = setInterval(() => {
                this.time++;
                this.timerElement.textContent = `Tiempo: ${this.time} segundos`;
            }, 1000);
            resolve();
        });
    }

    stopTime() {
        return new Promise((resolve) => {
            clearInterval(this.timerInterval);
            resolve();
        });
    }

    resetGame() {
        this.board.reset();
        this.matchedCards = [];
        this.count = 0;
        this.time = 0;
        this.points = 0;
        this.pointsElement.textContent = `Intentos: 0 Puntos: 0`;
        this.startTime()
    }

    pointsEarned() {
        this.maxPoints = this.maxPoints - (this.time * this.count * 10);
        if (this.maxPoints > 0) {
            this.points += this.maxPoints;
            console.log(this.points)
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);
    memoryGame.resetGame();

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
