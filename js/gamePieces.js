export class GopherDen {
  constructor(size, game){
    this.size = size
    this.game = game
    this.row = NaN
    this.column = NaN
    this.isVertical = Boolean(Math.round(Math.random()))
    this.index = game.gopherDens.length
    this.isDead = false
    
    //TODO make a better generation algorithm. this one will massively favor putting big pieces on the bottom or right edge. 
    //  smaller pieces are less affected because they're less likely to run out of the board.
    while (Number.isNaN(this.row)) {
      const startingPoint = Math.floor(Math.random() * 100)
      const newRow = Math.ceil( (startingPoint + 1)/10)
      const newColumn = startingPoint % 10 + 1
      this.setLocation (newRow, newColumn)
    }
  }

  setLocation(row, column) {
    let newRow = row
    let newColumn = column
    if (this.isVertical) {
      const maxDimension = newRow + this.size - 1
      if (maxDimension > 10) {
        newRow -= maxDimension - 10
      }
    } else {
      const maxDimension = newColumn + this.size - 1
      if (maxDimension > 10) {
        newColumn -= maxDimension - 10
      }
    }
    if (
      !this.game.checkForCollision(
        newRow,
        newColumn,
        this.size,
        this.isVertical,
        'gopher',
        this
      )
    ) {
      this.row = newRow
      this.column = newColumn
      return true
    }
    return false
  }
}

export class CarrotPlot {
  constructor(size, game) {
    this.size = size
    this.game = game
    this.row = NaN
    this.column = NaN
    this.isVertical = true
    this.index = game.carrotPlots.length

    this.element = document.createElement('div')
    this.element.className = 'carrotPlot vertical'
    this.element.id = `carrotPlot_${this.index}`

    for (let i = 0; i < size; i++) {
      const newCarrot = document.createElement('div')
      newCarrot.className = 'carrotSquare gridSquare'
      newCarrot.id = `carrotSquare_${i}`
      this.element.appendChild(newCarrot)
    }
  }

  static _plotCount = 0

  rotate() {
    this.isVertical = !this.isVertical
    if (!this.setLocation(this.row, this.column)) {
      this.isVertical = !this.isVertical
    }
  }

  setLocation(row, column) {
    let newRow = row
    let newColumn = column
    if (this.isVertical) {
      const maxDimension = newRow + this.size - 1
      if (maxDimension > 10) {
        newRow -= maxDimension - 10
      }
    } else {
      const maxDimension = newColumn + this.size - 1
      if (maxDimension > 10) {
        newColumn -= maxDimension - 10
      }
    }
    if (
      !this.game.checkForCollision(
        newRow,
        newColumn,
        this.size,
        this.isVertical,
        'player',
        this
      )
    ) {
      this.row = newRow
      this.column = newColumn
      return true
    }
    return false
  }
}

class TargetSquare {
  constructor(index) {
    this.index = index
    this.row = Math.floor(index / 10) + 1
    this.column = (index % 10) + 1
    this.element = document.createElement('div')
    this.isHit = false
    this.isMiss = false
  }
}

export class PlayerSquare extends TargetSquare {
  constructor(index) {
    super(index)
    this.element.className = 'playerSquare gridSquare'
    this.element.id = `playerSquare_${index}`
  }
}

export class GopherSquare extends TargetSquare {
  constructor(index) {
    super(index)
    this.element.className = 'gopherSquare gridSquare'
    this.element.id = `gopherSquare_${index}`
  }
}
