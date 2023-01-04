import * as tests from './tests.js'
import { CarrotPlot, PlayerSquare, GopherSquare } from './gamePieces.js'
import { Game } from './gameState.js'
//cache DOM objects
const view = {
  playerGrid: document.querySelector('#playerGrid'),
  gopherGrid: document.querySelector('#gopherGrid'),
  plotTray: document.querySelector('#plotTray'),
  playButton: null,
}

//state object
let game = {}

const clickPlot = function (event) {
  event.stopPropagation()
  console.log('click body')
  if (game.doubleClickFlag === this.id){
    console.log('double click')
    game.rotatePlot(this.id)
  } else if (!game.selectedPlot || game.selectedPlot.index != this.id.split('_')[1]) {
    game.selectPlot(this.id)
    console.log('start a click timer')
    game.startDoubleClickTimer(this.id)
  } else {
    const clickedPlot = game.carrotPlots[this.id.split('_')[1]]
    const plotIndexes = Game._createIndexList(clickedPlot.row, clickedPlot.column, clickedPlot.size, clickedPlot.isVertical)
    const offset = event.target.id.split('_')[1]
    game.movePlot(`playerSquare_${plotIndexes[offset]}`)
  }
  render()
}

const render = () => {
  const plotsToPlace = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  if (plotsToPlace.length === 0) {
    view.playButton = document.createElement('button')
    view.playButton.textContent = 'Start Game'
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
    plot.element.classList.remove('selected')
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

  if (game.selectedPlot) {
    game.selectedPlot.element.classList.add('selected')
  }
}

const initialize = () => {
  game = new Game()
  for (let i = 0; i < 100; i++) {
    const playerSquare = new PlayerSquare(i)
    game.addPlayerSquare(playerSquare)
    playerSquare.element.classList.add(`column${playerSquare.column}`)
    playerSquare.element.classList.add(`row${playerSquare.row}`)
    view.playerGrid.appendChild(playerSquare.element)

    const gopherSquare = new GopherSquare(i)
    game.addGopherSquare(gopherSquare)
    gopherSquare.element.classList.add(`column${gopherSquare.column}`)
    gopherSquare.element.classList.add(`row${gopherSquare.row}`)
    view.gopherGrid.appendChild(gopherSquare.element)
  }
  game.addCarrotPlot(new CarrotPlot(2, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(4, game))
  game.addCarrotPlot(new CarrotPlot(5, game))
  for (const plot of game.carrotPlots) {
    view.plotTray.appendChild(plot.element)
    plot.element.addEventListener('click', clickPlot)
  }

  playerGrid.addEventListener('click', (event) => {
    if (!game.selectedPlot) {
      return
    }
    game.movePlot(event.target.id)
    render()
  })
  render()
}

const reset = () => {
  view.playerGrid.textContent = ''
  view.gopherGrid.textContent = ''
  view.plotTray.textContent = ''
  initialize()
}

initialize()

if (false) {
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
  reset()
  tests.clickToPlace(game, (event) => {
    if (game.selectedPlot) {
      game.movePlot(event.target.id)
    }
    render()
  },render)
  console.log('reminder: test click to place with object collision')
}