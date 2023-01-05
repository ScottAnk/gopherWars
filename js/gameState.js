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
    this.gopher = new GopherAI(this)
    this.turn = ''
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

  _registerShotAbstract(shotIndex, board) {
    if (board != 'player' && board != 'gopher') {throw new Error('invalid board specifier')}
    const pieces = (board === 'player') ? this.carrotPlots : this.gopherDens
    const boardSquares = (board === 'player') ? this.playerSquares : this.gopherSquares
    for (let i = 0; i < pieces.length; i++) {
      const currentPiece = pieces[i]
      const pieceIndexes = Game._createIndexList(
        currentPiece.row,
        currentPiece.column,
        currentPiece.size,
        currentPiece.isVertical
      )
      for (let j = 0; j < pieceIndexes.length; j++) {
        if (shotIndex === pieceIndexes[j]) {
          boardSquares[shotIndex].isHit = true
          let pieceIsDead = true
          for (let k = 0; k < pieceIndexes.length; k++) {
            if (!boardSquares[pieceIndexes[k]].isHit) { 
              pieceIsDead = false
            }
          }
          currentPiece.isDead = pieceIsDead
          return (currentPiece.isDead) ? pieceIndexes : shotIndex
        }
      }
    }
    boardSquares[shotIndex].isMiss = true
    return false
  }

  registerPlayerShot(squareId) {
    if (this.turn === 'gopher'){
      return false
    }
    const shotIndex = Number(squareId.split('_')[1])
    if (this.gopherSquares[shotIndex].isHit || this.gopherSquares[shotIndex].isMiss) {
      return false
    }
    this._registerShotAbstract(shotIndex, 'gopher')
    this.turn = 'gopher'
    return true
  }

  requestGopherShot() {
    if (this.turn === 'player') {
      return false
    }
    const shotIndex = this.gopher.takeShot()
    const shotHit = this._registerShotAbstract(shotIndex, 'player')
    if (shotHit) {
      if (typeof shotHit === 'number') {
        this.gopher.notifyHit(shotHit)
      } else {
        this.gopher.notifyDeadPlot(shotHit)
      }
    }
    this.turn = 'player'
    return true 
  }
}

class GopherAI {
  constructor(game) {
    this.game = game
    this.activeHits = []
    this.previousShots = []
  }

  static _shuffleChoices (choices) {
    for (let i = choices.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices
  }

  _testTarget (targetIndex, originIndex=null) {
    if (targetIndex < 0 || targetIndex > 99) {return false}
    else if (this.previousShots.includes(targetIndex)) {return false}
    else if (originIndex){
      const targetSquare = this.game.playerSquares[targetIndex]
      const originSquare = this.game.playerSquares[originIndex]
      if (targetSquare.row != originSquare.row && targetSquare.column != originSquare.column) {
        return false
      }
    }
    return true
  }

  notifyHit(hitIndex) {
    this.activeHits.push(hitIndex)
  }

  notifyDeadPlot(plotIndexes) {
    plotIndexes.forEach((plotSquareIndex) => {
      const indexInActiveHits = this.activeHits.findIndex((element) => element === plotSquareIndex)
      if (indexInActiveHits > -1) {
        this.activeHits.splice(indexInActiveHits, 1)
      }
    })
  }

  _randomTarget() {
    let target = Math.floor(Math.random() * 100)
    while (!this._testTarget(target)) {
      target = Math.floor(Math.random() * 100)
    }
    return target
  }

  _sampleAroundPoint(startingPoint) {
    const directions = GopherAI._shuffleChoices([1, -1, 10, -10])
    for (let i = 0; i < directions.length; i ++) {
      const target = startingPoint + directions[i]
      const origin = startingPoint
      if (this._testTarget(target, origin)){
        return target
      }
    }
    throw new Error(`gopher could not find a valid target using activeHits: ${this.activeHits} and previousShots ${this.previousShots}`)
  }

  _extrapolatePoints(point1, point2) {
    let direction = Math.sign(point1 - point2) 
    if (this.game.playerSquares[point1].column === this.game.playerSquares[point2].column) {
      direction *= 10
    }
    
    let target = point1 + direction
    if (this._testTarget(target, point1)) {
      return target
    } else {
      target = point1 - direction
      while (this.activeHits.includes(target)) {target -= direction}
      if (this._testTarget(target, point1)){
        return target
      }
      return false
    }
  }

  takeShot() {
    if (this.activeHits.length === 0) {
      const target = this._randomTarget()
      this.previousShots.push(target)
      return target
    } 
    else if (this.activeHits.length === 1) {
      const target = this._sampleAroundPoint(this.activeHits[0])
      this.previousShots.push(target)
      return target
    } else {
      const hit1 = this.activeHits[this.activeHits.length-1]
      const hit2 = this.activeHits[this.activeHits.length-2]

      let target = this._extrapolatePoints(hit1, hit2) 
      if (target) {
        this.previousShots.push(target)
        return target
      } else {
        target = this._sampleAroundPoint(hit1)
        this.previousShots.push(target)
        return target
      }
    }

  }
}
