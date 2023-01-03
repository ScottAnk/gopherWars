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
}

class CarrotPlot {
  constructor(size) {
    this.size = size
    this.row = NaN
    this.column = NaN
    this.isVertical = true
    this.index = CarrotPlot._plotCount
    CarrotPlot._plotCount++

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
    //TODO
  }

  setLocation(row, column) {
    //TODO
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

render = () => {
  if (view.plotTray.childElementCount === 1) {
    view.playButton.classList.add('visible')
    view.playButton.classList.remove('hidden')
  } else {
    const plotsToPlace = Array.from(plotTray.querySelectorAll('.carrotPlot'))
    plotsToPlace.forEach((plotElement) => {
      plot = game.carrotPlots[plotElement.id.split('_')[1]]
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
      plot.element.style.gridColumnEnd = 'span ${plot.size}'

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

initialize()
