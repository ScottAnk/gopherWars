import * as tests from './tests.js'
//cache DOM objects
const view = {
  playerGrid: document.querySelector('#playerGrid'),
  gopherGrid: document.querySelector('#gopherGrid'),
  plotTray: document.querySelector('#plotTray'),
  playButton: document.querySelector('#playButton'),
}

//state object
let game = {}

class Game {
  constructor() {
    this.playerSquares = []
    this.gopherSquares = []
    this.carrotPlots = []
    this.selectedPlot = null
  }

  static _createIndexList(row, column, size, vertical) {
    const indexes = []
    const increment = vertical ? 10 : 1
    for (let i = 0; i < size; i++) {
      indexes[i] = (row-1) * 10 + (column-1) + increment * i
    }
    return indexes
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

  movePlot(squareId) {
    const targetSquare = this.playerSquares[squareId.split('_')[1]]
    this.selectedPlot.setLocation(targetSquare.row, targetSquare.column)
    this.selectedPlot = null
  }

  checkForCollision(row, column, size, vertical, exempt = null) {
    const checkLocations = Game._createIndexList(row, column, size, vertical)
    for (let i = 0; i < this.carrotPlots.length; i++) {
      const plot = this.carrotPlots[i]
      if (plot === exempt) {
        continue
      }
      const plotIndexes = Game._createIndexList(
        plot.row,
        plot.column,
        plot.size,
        plot.isVertical
      )
      for (let j = 0; j < plotIndexes.length; j++) {
        if (checkLocations.includes(plotIndexes[j])){
          return true
        }
      }                            

        
    }
  }
}

class CarrotPlot {
  constructor(size) {
    this.size = size
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
      this.element.appendChild(newCarrot)
    }
  }

  static _plotCount = 0

  rotate() {
    this.isVertical = !this.isVertical
    if (!this.setLocation(this.row, this.column)){
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
    if (!game.checkForCollision(newRow, newColumn, this.size, this.isVertical, this)) {
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
    this.containsPlot = false
    this.row = Math.floor(index / 10) + 1
    this.column = (index % 10) + 1
    this.element = document.createElement('div')
  }
}

class PlayerSquare extends TargetSquare {
  constructor(index) {
    super(index)
    this.element.className = 'playerSquare gridSquare'
    this.element.id = `playerSquare_${index}`
  }
}

class GopherSquare extends TargetSquare {
  constructor(index) {
    super(index)
    this.element.className = 'gopherSquare gridSquare'
    this.element.id = `gopherSquare_${index}`
  }
}

const render = () => {
  const plotsToPlace = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  if (plotsToPlace.length === 0) {
    view.playButton.classList.add('visible')
    view.playButton.classList.remove('hidden')
  } else {
    plotsToPlace.forEach((plotElement) => {
      const plot = game.carrotPlots[plotElement.id.split('_')[1]]
      if (plot.row && plot.column) {
        plotTray.removeChild(plot.element)
        view.playerGrid.appendChild(plot.element)
      }
    })
  }

  game.carrotPlots.forEach((plot) => {
    if (!plot.row) {
      return
    }
    plot.element.style.gridRowStart = plot.row
    plot.element.style.gridColumnStart = plot.column
    if (plot.isVertical) {
      plot.element.classList.add('vertical')
      plot.element.classList.remove('horizontal')
      plot.element.style.gridRowEnd = `span ${plot.size}`
      plot.element.style.gridColumnEnd = 'span 1'
    } else {
      plot.element.classList.add('horizontal')
      plot.element.classList.remove('vertical')
      plot.element.style.gridRowEnd = `span 1`
      plot.element.style.gridColumnEnd = `span ${plot.size}`
    }
  })
}

const initialize = () => {
  game = new Game()
  for (let i = 0; i < 100; i++) {
    const playerSquare = new PlayerSquare(i)
    game.addPlayerSquare(playerSquare)
    view.playerGrid.appendChild(playerSquare.element)

    const gopherSquare = new GopherSquare(i)
    game.addGopherSquare(gopherSquare)
    view.gopherGrid.appendChild(gopherSquare.element)
  }
  game.addCarrotPlot(new CarrotPlot(2))
  game.addCarrotPlot(new CarrotPlot(3))
  game.addCarrotPlot(new CarrotPlot(3))
  game.addCarrotPlot(new CarrotPlot(4))
  game.addCarrotPlot(new CarrotPlot(5))
  for (const plot of game.carrotPlots) {
    view.plotTray.appendChild(plot.element)
  }

  render()
}

const reset = () => {
  view.playerGrid.textContent = ""
  view.gopherGrid.textContent = ""
  view.plotTray.textContent = ""
  view.playButton.classList.remove("visible")
  view.playButton.classList.add("hidden")
  initialize()
}

initialize()

tests.rotateOOBHorizontal(game, render)
reset()
tests.rotateOOBVertical(game, render)
reset()
tests.placementOOBVertical(game, render)
reset()
tests.placementOOBHorizontal(game, render)
reset()
tests.placementOverlappingVertical(game, render)
reset()
tests.placementOverlappingHorizontal(game, render)