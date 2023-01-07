import * as tests from './tests.js'
import { CarrotPlot, PlayerSquare, GopherSquare } from './gamePieces.js'
import { Game } from './gameState.js'

const debugMode = true
const runTests = false
//cache DOM objects
const view = {
  playerGrid: document.querySelector('#playerGrid'),
  gopherGrid: document.querySelector('#gopherGrid'),
  plotTray: document.querySelector('#plotTray'),
  gameResult: document.querySelector('#gameResult'),
  gopherWin: document.querySelector('#gopherWin'),
  playerWin: document.querySelector('#playerWin'),
  resetButton: null,
  playButton: null,
}

//state object
let game = {}

const clickPlot = function (event) {
  event.stopPropagation()
  if (game.doubleClickFlag === this.id){
    game.rotatePlot(this.id)
  } else if (!game.selectedPlot || game.selectedPlot.index != this.id.split('_')[1]) {
    game.selectPlot(this.id)
    game.startDoubleClickTimer(this.id)
  } else {
    const clickedPlot = game.carrotPlots[this.id.split('_')[1]]
    const plotIndexes = Game._createIndexList(clickedPlot.row, clickedPlot.column, clickedPlot.size, clickedPlot.isVertical)
    const offset = event.target.id.split('_')[1]
    game.movePlot(`playerSquare_${plotIndexes[offset]}`)
    game.startDoubleClickTimer(this.id)
  }
  setupPhaseRender()
}

const anchorCarrotLocations = () => {
  game.carrotPlots.forEach((plot) => {
    plot.element.removeEventListener('click', clickPlot)
    plot.element.classList.add('hidden')
  })
}

const promptGopherTurn = () => {
  if (!game.requestGopherShot()) {
    throw new Error('requested gopher turn out of phase')
  }
  gameplayRender()
}

const doPlayerTurn = (event) => {
    if (!(event.target.id.split('_')[0] === 'gopherSquare')) { 
      return
    }
    if (game.registerPlayerShot(event.target.id)) {
      setTimeout(promptGopherTurn, debugMode ? 100 : 800)
    }
    gameplayRender()
  }

const gameplayRender = () => {
  game.playerSquares.forEach( (square) => {
    if (square.isMiss) { square.element.classList.add('gopherMiss') }
    else if (square.isHit) {square.element.classList.add('gopherHit')}
    //TODO would be a nice effect to style the whole plot differently if all squares have been hit
  })
  game.gopherSquares.forEach( (square) => {
    if (square.isMiss) { square.element.classList.add('playerMiss') }
    else if (square.isHit) {square.element.classList.add('playerHit')}
  })
  game.gopherDens.forEach( (den) => {
    if (den.isDead) {
      const indexesToMark = Game._createIndexList(den.row, den.column, den.size, den.isVertical)
      indexesToMark.forEach((index) => {
        game.gopherSquares[index].element.classList.add('deadDen')
        game.gopherSquares[index].element.classList.remove('playerHit')
      })
    }
  })
  const endGame = game.checkWinner()
  if (endGame) {
    view.gameResult.classList.remove('hidden')
    if (endGame === 'player') {
      view.playerWin.classList.remove('hidden')
    } else {
      view.gopherWin.classList.remove('hidden')
    }
  }
}

const startGame = () => {
  anchorCarrotLocations()
  game.makeGopherDens([2,3,3,4,5])
  view.plotTray.classList.add('hidden')
  if (debugMode) {window.showDens()}
  view.gopherGrid.addEventListener('click', doPlayerTurn)
  game.carrotPlots.forEach((plot) => {
    const carrotIndexes = Game._createIndexList(
      plot.row,
      plot.column,
      plot.size,
      plot.isVertical
    )
    carrotIndexes.forEach((squareIndex) => {
      game.playerSquares[squareIndex].element.classList.add('carrotSquare')
    })
  })
  gameplayRender()
}

const startButtonCheck = () => {
  const plotsInTray = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  if (plotsInTray.length === 0 && view.playButton === null) {
    view.playButton = document.createElement('button')
    view.playButton.textContent = 'Start Game'
    view.plotTray.appendChild(view.playButton)
    view.playButton.addEventListener('click', startGame)
  } 
}

const setupPhaseRender = () => {
  let plotsToPlace = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  plotsToPlace.forEach((plotElement) => {
    const plot = game.carrotPlots[plotElement.id.split('_')[1]]
    if (plot.row && plot.column) {
      plotTray.removeChild(plot.element)
      view.playerGrid.appendChild(plot.element)
    }
  })

  startButtonCheck()


  //update plot locations and styles according to data
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
    
  if (view.resetButton === null) {
    view.resetButton = document.querySelector('#resetButton')
    view.resetButton.addEventListener('click',reset)
  }
  
  //TODO these carrotplot declarations should really be handled inside the game object
  //  Taking an array like pickGopherPlots will allow flexability for changing boat types
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
    setupPhaseRender()
  })
  setupPhaseRender()
}

const reset = () => {
  //TODO BUG reset doesn't clear the result div
  view.playerGrid.textContent = ''
  view.gopherGrid.textContent = ''
  view.plotTray.textContent = ''
  view.plotTray.classList.remove('hidden')
  view.playButton = null
  initialize()
}

initialize()

if (runTests) {
  //test code
  const gridClickHandler = (event) => {
    if (!game.selectedPlot) {
      return
    }
    game.movePlot(event.target.id)
    setupPhaseRender()
  }
  tests.rotateOOBHorizontal(game, setupPhaseRender)
  reset()
  tests.rotateOOBVertical(game, setupPhaseRender)
  reset()
  tests.placementOOBVertical(game, setupPhaseRender)
  reset()
  tests.placementOOBHorizontal(game, setupPhaseRender)
  reset()
  tests.placementOverlappingVertical(game, setupPhaseRender)
  reset()
  tests.placementOverlappingHorizontal(game, setupPhaseRender)
  reset()
  tests.clickToPlace(game, (event) => {
    if (game.selectedPlot) {
      game.movePlot(event.target.id)
    }
    setupPhaseRender()
  })
  reset()
  tests.clickToPlaceCollision(game, gridClickHandler, clickPlot)
  reset()
  tests.doubleClickToRotate(game, gridClickHandler, clickPlot)
  reset()
  tests.doubleClickToRotateCollision(game, gridClickHandler, clickPlot)
  reset()
  tests.placeAllPlots(game, gridClickHandler, clickPlot)
}
if (debugMode) {
  //debugging features
  window.game = game
  window.reset = reset
  window.setupPhaseRender = setupPhaseRender
  window.gameplayRender = gameplayRender
  window.showDens = () => {
    game.gopherDens.forEach((den) => {
      const squaresToMark = game.constructor._createIndexList(
        den.row,
        den.column,
        den.size,
        den.isVertical
      )
      squaresToMark.forEach((squareIndex) => {
        game.gopherSquares[squareIndex].element.classList.add('debug')
      })
    })
  }
  window.testDenGenerator = () => {
    game.gopherSquares.forEach((square) => {
      square.element.classList.remove('debug')
    })
    game.gopherDens = []
    game.makeGopherDens([2,3,3,4,5])
    window.showDens()
  }
}