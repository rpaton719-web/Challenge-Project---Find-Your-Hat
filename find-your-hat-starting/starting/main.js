const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";

class Field {
  constructor(field) {
    this._field = field;
  }

  print() {
    return this._field.map((row) => row.join("")).join("\n");
  }

  static generateField(height, width, percentage) {
    if (!Number.isInteger(height) || height < 1) {
      throw new RangeError("Height must be a positive integer.");
    }
    if (!Number.isInteger(width) || width < 1) {
      throw new RangeError("Width must be a positive integer.");
    }
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      throw new RangeError("Hole percentage must be between 0 and 100.");
    }
    if (height * width < 2) {
      throw new RangeError("The field needs at least two spaces for you and your hat.");
    }

    const field = Array.from({ length: height }, () =>
      Array(width).fill(fieldCharacter)
    );
    const availablePositions = Array.from(
      { length: height * width - 1 },
      (_, index) => index + 1
    );
    const hatPositionIndex = Math.floor(Math.random() * availablePositions.length);
    const hatPosition = availablePositions.splice(hatPositionIndex, 1)[0];
    field[Math.floor(hatPosition / width)][hatPosition % width] = hat;

    for (let index = availablePositions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [availablePositions[index], availablePositions[swapIndex]] = [
        availablePositions[swapIndex],
        availablePositions[index],
      ];
    }

    const holeCount = Math.min(
      Math.floor((height * width * percentage) / 100),
      availablePositions.length
    );
    for (const position of availablePositions.slice(0, holeCount)) {
      field[Math.floor(position / width)][position % width] = hole;
    }

    field[0][0] = pathCharacter;
    return field;
  }
}

function play() {
  const field = new Field(Field.generateField(10, 10, 20));
  let playerRow = 0;
  let playerColumn = 0;

  console.log("Find your hat! Move with W (up), A (left), S (down), or D (right).");
  console.log(field.print());

  while (true) {
    const direction = prompt("Your move: ").trim().toLowerCase();
    const nextPosition = { row: playerRow, column: playerColumn };

    if (direction === "w") nextPosition.row -= 1;
    else if (direction === "s") nextPosition.row += 1;
    else if (direction === "a") nextPosition.column -= 1;
    else if (direction === "d") nextPosition.column += 1;
    else {
      console.log("Please enter W, A, S, or D.");
      continue;
    }

    if (
      nextPosition.row < 0 ||
      nextPosition.row >= field._field.length ||
      nextPosition.column < 0 ||
      nextPosition.column >= field._field[0].length
    ) {
      console.log("You walked off the field. Game over!");
      break;
    }

    const destination = field._field[nextPosition.row][nextPosition.column];
    field._field[playerRow][playerColumn] = fieldCharacter;
    playerRow = nextPosition.row;
    playerColumn = nextPosition.column;

    if (destination === hole) {
      console.log(field.print());
      console.log("You fell into a hole. Game over!");
      break;
    }
    if (destination === hat) {
      field._field[playerRow][playerColumn] = hat;
      console.log(field.print());
      console.log("You found your hat. You win!");
      break;
    }

    field._field[playerRow][playerColumn] = pathCharacter;
    console.log(field.print());
  }
}

if (require.main === module) {
  play();
}

module.exports = { Field };
