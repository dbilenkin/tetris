const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const size = 30;
let score = 0;

const levelSpeeds = [.625, .69, .79, .91, 1.07, 1.3, 1.67, 2.3, 3.75, 5];
let level = 0;
let speed = levelSpeeds[level];
let numPieces = 0;
let totalLinesCleared = 0;

let frame = 0;
let pause = false;

let piece;
let rowsCleared = 0;
let boardDroppedY = 0;
let board;

const rowsClearedScores = [40, 100, 300, 1200];
const typeArray = ["line", "square", "t", "s", "z", "l", "r"];

const types = {
    line: {
        orientations: [
            [[1, 1, 1, 1]],
            [[1], [1], [1], [1]]
        ],
        color: '#264653',
        nextOffset: [1, 2]
    },
    square: {
        orientations: [
            [[1, 1], [1, 1]]
        ],
        color: '#287271',
        nextOffset: [2, 1.5]
    },
    t: {
        orientations: [
            [[0, 1], [1, 1, 1]],
            [[1], [1, 1], [1]],
            [[1, 1, 1], [0, 1]],
            [[0, 1], [1, 1], [0, 1]]
        ],
        color: '#2A9D8F',
        nextOffset: [1.5, 1.5]
    },
    s: {
        orientations: [
            [[0, 1, 1], [1, 1]],
            [[1], [1, 1], [0, 1]],
        ],
        color: '#8AB17D',
        nextOffset: [1.5, 1.5]
    },
    z: {
        orientations: [
            [[1, 1], [0, 1, 1]],
            [[0, 1], [1, 1], [1]],
        ],
        color: '#E9C46A',
        nextOffset: [1.5, 1.5]
    },
    l: {
        orientations: [
            [[1], [1], [1, 1]],
            [[1, 1, 1], [1]],
            [[1, 1], [0, 1], [0, 1]],
            [[0, 0, 1], [1, 1, 1]]
        ],
        color: '#F4A261',
        nextOffset: [2, 1]
    },
    r: {
        orientations: [
            [[0, 1], [0, 1], [1, 1]],
            [[1], [1, 1, 1]],
            [[1, 1], [1], [1]],
            [[1, 1, 1], [0, 0, 1]]
        ],
        color: '#E76F51',
        nextOffset: [2, 1]
    }
}

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');;
setNextType();

function drawSquare(context=ctx, x, y, color, border = "black") {
    context.fillStyle = color;
    context.fillRect(x, y, size, size);

    context.strokeStyle = border;
    context.strokeRect(x, y, size - 1, size - 1);
}

function draw() {
    drawPiece();
    drawBoard();
}

function drawPiece(next=false) {
    const type = next ? types[nextType] : types[piece.type];
    const orientation = next ? type.orientations[0] : type.orientations[piece.orientationIndex];
    for (let i = 0; i < orientation.length; i++) {
        const row = orientation[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j]) {
                if (next) {
                    drawSquare(nextCtx, (type.nextOffset[0] + j) * size, (type.nextOffset[1] + i) * size, type.color);
                } else {
                    drawSquare(ctx, (piece.col + j) * size, (piece.y + (i * size)), type.color);
                }
                
            }
        }
    }
}

function drawBoard() {
    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j]) {
                drawSquare(ctx, (j) * size, (i) * size, row[j]);
            }
        }
    }
}


function setNextType() {
    nextType = typeArray[Math.floor(Math.random() * typeArray.length)];
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    drawPiece(true);
}

function createPiece() {
    numPieces++;
    if (totalLinesCleared >= (level + 1) * (level + 2)) {
        level++;
        updateLevel();
        speed = levelSpeeds[level];
    }

    piece = {
        x: 4,
        y: 0,
        row: 0,
        col: 4,
        orientationIndex: 0,
        type: nextType
    };
    setNextType();
}

function addToBoard() {
    const orientation = types[piece.type].orientations[piece.orientationIndex];
    for (let i = 0; i < orientation.length; i++) {
        const row = orientation[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j]) {
                board[piece.row + i][piece.col + j] = types[piece.type].color;
            }
        }
    }
}

function checkPieceContact() {
    const orientation = types[piece.type].orientations[piece.orientationIndex];
    for (let i = 0; i < orientation.length; i++) {
        const row = orientation[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j] && (piece.row + i >= 19 || board[piece.row + i + 1][piece.col + j])) {
                addToBoard();
                speed = levelSpeeds[level];
                return true;
            }
        }
    }
}

function checkMoveContact(direction) {
    const orientation = types[piece.type].orientations[piece.orientationIndex];
    for (let i = 0; i < orientation.length; i++) {
        const row = orientation[i];
        for (let j = 0; j < row.length; j++) {
            if (direction === "left") {
                if (row[j] && (board[piece.row + i][piece.col + j - 1])) {
                    return false;
                }
            } else if (direction === "right") {
                if (row[j] && (board[piece.row + i][piece.col + j + 1])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function drawBoardDropping() {
    boardDroppedY += Math.max(1, speed);
    let originalRowsCleared = rowsCleared;
    if (boardDroppedY > rowsCleared * size) {
        for (let i = clearRow - 1; i >= 0; i--) {
            const row = board[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j] && board[i + originalRowsCleared]) {
                    board[i + originalRowsCleared][j] = row[j];
                    row[j] = false;
                }
            }
        }
        rowsCleared = 0;
        boardDroppedY = 0;
        createPiece();
    }

    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        for (let j = 0; j < row.length; j++) {
            if (row[j]) {
                if (i < clearRow) {
                    drawSquare(ctx, (j) * size, (i) * size + boardDroppedY, row[j]);
                } else {
                    drawSquare(ctx, (j) * size, (i) * size, row[j]);
                }
            }
        }
    }
}

function updateScore(rowsCleared) {
    score += rowsClearedScores[rowsCleared - 1] * (level + 1);
    document.querySelector('#score').innerHTML = score;
}

function updateLinesCleared() {
    document.querySelector('#linesCleared').innerHTML = totalLinesCleared;
}

function updateLevel() {
    document.querySelector('#level').innerHTML = level;
}


function checkRowCompletion() {
    for (let i = 0; i < board.length; i++) {
        const row = board[i];
        let rowComplete = true;
        for (let j = 0; j < row.length; j++) {
            if (!row[j]) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) {
            for (let j = 0; j < row.length; j++) {
                row[j] = false;
            }
            rowsCleared++;
            totalLinesCleared++;
            updateLinesCleared();
            clearRow = i;
        }
    }
    if (rowsCleared > 0) {
        updateScore(rowsCleared);
    }
    return rowsCleared > 0;
}

function checkGameOver() {
    const topRow = board[0];
    for (let i = 0; i < topRow.length; i++) {
        if (topRow[i]) {
            resetGame();
            // alert("Game Over");
            createPiece();
            break;
        }
    }
}

function checkBoard(piece) {
    const contact = checkPieceContact(piece);
    const rowsCleared = checkRowCompletion();
    if (contact & !rowsCleared) {
        createPiece();
    }
    checkGameOver();
}

function resetGame() {
    board = Array.from(Array(20), () => {
        return new Array(10).fill(false)
    })

    speed = levelSpeeds[level];
    rowsCleared = 0;
    boardDroppedY = 0;
}

//////////////////////////////
// START
//////////////////////////////
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

function animate() {

    // request another frame
    window.requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        if (rowsCleared > 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBoardDropping();
        } else {
            piece.y += speed;
            piece.row = Math.floor(piece.y / 30);
            checkBoard(piece);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw();
        }
    }
}

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    window.requestAnimationFrame(animate);
}

function main() {
    resetGame();
    createPiece();
    startAnimating(60);
}

main();

document.addEventListener("keydown", movePiece);
document.addEventListener("keyup", keyUpHandler);

function movePiece(e) {
    //   console.log(e.code);
    const orientation = types[piece.type].orientations[piece.orientationIndex];
    const maxLength = orientation.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 0);
    switch (e.code) {
        case 'ArrowLeft':
            if (piece.col > 0 && checkMoveContact("left")) {
                piece.col--;
            }
            break;
        case 'ArrowRight':
            if (piece.col + maxLength < 10 && checkMoveContact("right")) {
                piece.col++;
            }
            break;
        case 'ArrowUp':
            piece.orientationIndex = (piece.orientationIndex + 1) % types[piece.type].orientations.length;
            break;
        case 'ArrowDown':
            speed = 10;
            break;
        default:
            break;
    }
}

function keyUpHandler(e) {
    switch (e.code) {
        case 'ArrowDown':
            speed = levelSpeeds[level];
            break;
    }
}