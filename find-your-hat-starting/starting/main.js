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

  static isSolvable(field) {
    if (
      !Array.isArray(field) ||
      field.length === 0 ||
      !Array.isArray(field[0]) ||
      field[0].length === 0 ||
      !field.every((row) => Array.isArray(row) && row.length === field[0].length)
    ) {
      return false;
    }

    let start;
    let hatPosition;
    for (let row = 0; row < field.length; row += 1) {
      for (let column = 0; column < field[row].length; column += 1) {
        if (field[row][column] === pathCharacter) start = [row, column];
        if (field[row][column] === hat) hatPosition = [row, column];
      }
    }
    if (!start || !hatPosition) return false;

    const queue = [start];
    const visited = new Set([`${start[0]},${start[1]}`]);
    for (let index = 0; index < queue.length; index += 1) {
      const [row, column] = queue[index];
      if (row === hatPosition[0] && column === hatPosition[1]) return true;

      for (const [nextRow, nextColumn] of [
        [row - 1, column],
        [row + 1, column],
        [row, column - 1],
        [row, column + 1],
      ]) {
        const key = `${nextRow},${nextColumn}`;
        if (
          nextRow >= 0 &&
          nextRow < field.length &&
          nextColumn >= 0 &&
          nextColumn < field[0].length &&
          field[nextRow][nextColumn] !== hole &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push([nextRow, nextColumn]);
        }
      }
    }
    return false;
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
      { length: height * width },
      (_, index) => index
    );
    const startPositionIndex = Math.floor(Math.random() * availablePositions.length);
    const startPosition = availablePositions.splice(startPositionIndex, 1)[0];
    field[Math.floor(startPosition / width)][startPosition % width] = pathCharacter;

    const hatPositionIndex = Math.floor(Math.random() * availablePositions.length);
    const hatPosition = availablePositions.splice(hatPositionIndex, 1)[0];
    field[Math.floor(hatPosition / width)][hatPosition % width] = hat;

    const safePath = new Set([startPosition]);
    let row = Math.floor(startPosition / width);
    let column = startPosition % width;
    const hatRow = Math.floor(hatPosition / width);
    const hatColumn = hatPosition % width;
    const steps = [];
    for (let count = 0; count < Math.abs(hatRow - row); count += 1) {
      steps.push([Math.sign(hatRow - row), 0]);
    }
    for (let count = 0; count < Math.abs(hatColumn - column); count += 1) {
      steps.push([0, Math.sign(hatColumn - column)]);
    }
    for (let index = steps.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [steps[index], steps[swapIndex]] = [steps[swapIndex], steps[index]];
    }
    for (const [rowStep, columnStep] of steps) {
      row += rowStep;
      column += columnStep;
      safePath.add(row * width + column);
    }

    const holePositions = availablePositions.filter(
      (position) => !safePath.has(position)
    );
    for (let index = holePositions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [holePositions[index], holePositions[swapIndex]] = [
        holePositions[swapIndex],
        holePositions[index],
      ];
    }

    const holeCount = Math.min(
      Math.floor((height * width * percentage) / 100),
      holePositions.length
    );
    for (const position of holePositions.slice(0, holeCount)) {
      field[Math.floor(position / width)][position % width] = hole;
    }

    if (!Field.isSolvable(field)) {
      throw new Error("Generated field is not solvable.");
    }
    return field;
  }
}

function play() {
  const field = new Field(Field.generateField(10, 10, 20));
  let playerRow = field._field.findIndex((row) => row.includes(pathCharacter));
  let playerColumn = field._field[playerRow].indexOf(pathCharacter);

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
