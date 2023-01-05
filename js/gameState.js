import { GopherDen } from "./gamePieces.js"

export class Game {
  constructor() {
    this.playerSquares = []
    this.gopherSquares = []
    this.carrotPlots = []
    this.gopherDens = []
    //TODO the fields below relate to handling clicks. that should really be stored and processed by the controller
    this.selectedPlot = null
    this.doubleClickFlag = false
    this.timer = null
    this.gopher = new GopherAI()
  }

  static _createIndexList(row, column, size, vertical) {
    const indexes = []
    const increment = vertical ? 10 : 1
    for (let i = 0; i < size; i++) {
      indexes[i] = (row - 1) * 10 + (column - 1) + increment * i
    }
    return indexes
  }

  startDoubleClickTimer(plotId) {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.doubleClickFlag = plotId
    this.timer = setTimeout(
      function (game) {
        game.doubleClickFlag = false
        game.timer = null
      },
      400,
      this
    )
  }

  addCarrotPlot(carrotPlot) {
    this.carrotPlots.push(carrotPlot)
  }

  addPlayerSquare(playerSquare) {
    this.playerSquares[playerSquare.index] = playerSquare
  }

  addGopherSquare(gopherSquare) {
    this.gopherSquares[gopherSquare.index] = gopherSquare
  }

  selectPlot(plotId) {
    this.selectedPlot = this.carrotPlots[plotId.split('_')[1]]
  }

  rotatePlot(plotId) {
    const targetPlot = this.carrotPlots[plotId.split('_')[1]]
    if (targetPlot.row) {
      targetPlot.rotate()
    }
    this.doubleClickFlag = false
    this.selectedPlot = null
  }

  movePlot(squareId) {
    const targetSquare = this.playerSquares[squareId.split('_')[1]]
    this.selectedPlot.setLocation(targetSquare.row, targetSquare.column)
    this.doubleClickFlag = false
    this.selectedPlot = null
  }

  checkForCollision(row, column, size, vertical, board, exempt = null) {
    let boardPieces
    if (board === 'gopher') { boardPieces = this.gopherDens}
    else if (board === 'player') { boardPieces = this.carrotPlots}
    else {throw new Error('invalid board specifier')}

    const checkLocations = Game._createIndexList(row, column, size, vertical)
    for (let i = 0; i < boardPieces.length; i++) {
      const piece = boardPieces[i]
      if (piece === exempt) {
        continue
      }
      const pieceIndexes = Game._createIndexList(
        piece.row,
        piece.column,
        piece.size,
        piece.isVertical
      )
      for (let j = 0; j < pieceIndexes.length; j++) {
        if (checkLocations.includes(pieceIndexes[j])) {
          return true
        }
      }
    }
  }
  
  makeGopherDens(sizes) {
    for (let i = 0; i < sizes.length; i++) {
      this.gopherDens.push(new GopherDen(sizes[i], this))
    }
  }

  registerPlayerShot(squareId) {
    const shotIndex = Number(squareId.split('_')[1])
    for (let i = 0; i < this.gopherDens.length; i++) {
      const denSquareIndexes = Game._createIndexList(
        this.gopherDens[i].row,
        this.gopherDens[i].column,
        this.gopherDens[i].size,
        this.gopherDens[i].isVertical
      )
      for (let j = 0; j < denSquareIndexes.length; j++) {
        if (shotIndex === denSquareIndexes[j]) {
          this.gopherSquares[shotIndex].isHit = true
          let denIsDead = true
          for (let k = 0; k < denSquareIndexes.length; k++) {
            if (!this.gopherSquares[denSquareIndexes[k]].isHit) { denIsDead = false}
          }
          this.gopherDens[i].isDead = denIsDead
          return
        }
      }
    }
    this.gopherSquares[shotIndex].isMiss = true
  }
}

class GopherAI {
  constructor(){
    this.activeHits = []
    this.previousShots = []
  }

  takeShot(){}
}
