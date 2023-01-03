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
  game.addCarrotPlot(new CarrotPlot(2, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(4, game))
  game.addCarrotPlot(new CarrotPlot(5, game))
  for (const plot of game.carrotPlots) {
    view.plotTray.appendChild(plot.element)
  }

  render()
}

const reset = () => {
  view.playerGrid.textContent = ''
  view.gopherGrid.textContent = ''
  view.plotTray.textContent = ''
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
