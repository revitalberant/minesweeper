'use strict'

const MINE = '💣';
const FLAG = '🚩';
const PLAY = '😀'
const LOSE = '🤯'
const WIN= '😎'


var gBoard;
var gFirstClick = true
var gTimer;

var gLevel = {
    size: 4,
    mines: 2
};

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
};


function initGame() {
    gGame.lives = 3;
    gGame.isOn = true;
    gBoard = buildBoard();
    gFirstClick = true
    createMines(gLevel.mines)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    renderLives()
    var minutesLabel = document.querySelector(".minutes");
    var secondsLabel = document.querySelector(".seconds");
    minutesLabel.innerHTML = '0'
    secondsLabel.innerHTML = '0'
    gGame.shownCount = 0;
}

function buildBoard() {

    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board.push([])
        for (var j = 0; j < gLevel.size; j++) {
            var cell = createCell();
            board[i][j] = cell
        }
    }
    return board;

}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    };
}

function createMines(numMines) {
    while (numMines > 0) {
        var emptyCell = getEmptyCell();
        gBoard[emptyCell.i][emptyCell.j].isMine = true;
        numMines--
    }
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = `cell cell-${i}-${j}`;
            strHtml += '<td class ="' + className + '"' + 'onClick = "cellClicked(this,' +
                i + ' ,' + j + ')" onContextMenu="cellMarked(this, event,' + i + ',' + j + ' )"> ';

            strHtml += cell.isShown ? cell.isMine ? MINE : cell.minesAroundCount : '';
            strHtml += cell.isMarked ? FLAG : '';

            strHtml += '</td>'
        }
        strHtml += '</tr>';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            currCell.minesAroundCount = countNegs(i, j, gBoard, 'isMine')
        }
    }
    return gBoard
}

function getEmptyCell() {
    var emptyCells = [];

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isMine) {
                var emptyCellPos = { i, j };
                emptyCells.push(emptyCellPos);
            }
        }
    }

    var randomIdx = getRandomInt(0, emptyCells.length);
    var emptyCell = emptyCells[randomIdx];

    return emptyCell;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

    if (gFirstClick) {
        setTime();
        gFirstClick = false;
        gTimer = setInterval(setTime, 1000);
    }



    if (gBoard[i][j].isMine) {
        gGame.lives--
        renderLives()
        if(gGame.lives === 0) {
            revealOtherMines()
            gameOver()
            document.querySelector('.Play').innerHTML = LOSE;
        }
        
    } else {
        if (gBoard[i][j].minesAroundCount == 0) {
            openNegs(i, j)
        }

        // console.log(gGame.shownCount)
        if ((gGame.shownCount+1) === ((gBoard.length * gBoard[0].length) - gLevel.mines) &&
             gGame.markedCount === gLevel.mines) {
            gameOver()
            document.querySelector('.Play').innerHTML = WIN;
        }
    }

    openCell({i, j});
    renderBoard(gBoard)
}

function cellMarked(elCell, ev, i, j) {
    window.addEventListener("contextmenu", e => e.preventDefault());
    if (!gGame.isOn) return

    var cell = gBoard[i][j]

    if (cell.isShown) return;
    var elMarkedCount = document.querySelector('.markedCount')
    if (!cell.isMarked) {

        cell.isMarked = true;
        gGame.markedCount++

    } else {
        cell.isMarked = false;
        gGame.markedCount--;
    }
    
  

    elMarkedCount.innerHTML = gGame.markedCount;
    renderBoard(gBoard)
}


function gameOver() {
    gGame.isOn = false;
    clearInterval(gTimer);
}

function revealOtherMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
            }
        }
    }
    renderBoard(gBoard)
}

function ChangeLevelBegginer() {
    gLevel.size = 4;
    gLevel.mines = 2;
    restart();
}

function ChangeLevelMedium() {
    gLevel.size = 8;
    gLevel.mines = 12;
    restart();
}

function ChangeLevelExpert() {
    gLevel.size = 12;
    gLevel.mines = 30;
    restart();
}

function clearBoard() {
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = '';
}

function restart() {
    gameOver();
    clearInterval(gTimer)
    initGame();
    document.querySelector('.Play').innerHTML = PLAY;
}

function openNegs(i, j) {
    if (i >= gBoard.length || i < 0) return;
    if (j >= gBoard[i].length || j < 0) return;
    if (gBoard[i][j].isMine) return;
    if (gBoard[i][j].minesAroundCount > 0) return;
    if (gBoard[i][j].isShown) return;
    
    openCell({i, j})
    openNegs(i + 1, j)
    openNegs(i - 1, j)
    openNegs(i, j + 1)
    openNegs(i, j - 1)
}


function renderLives() {
    var life = `🖤`;
    var numLives = '';
    for (var i = 0; i < gGame.lives; i++) {
        numLives += life;
    }
    document.querySelector('.life').innerHTML = numLives;
}

function openCell(cell) {
    if (!gBoard[cell.i][cell.j].isShown) {
        gBoard[cell.i][cell.j].isMarked = false;
        gBoard[cell.i][cell.j].isShown = true;
        if (!gBoard.isMine) {
            gGame.shownCount++;
        }
    }
}