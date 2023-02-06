import * as tests from './tests.js'
import { CarrotPlot, PlayerSquare, GopherSquare } from './gamePieces.js'
import { Game } from './gameState.js'

const debugMode = true
const runTests = true
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

/** @param {Event} event handler for clicking a player piece on the board */
const clickPlot = function (event) {
  event.stopPropagation()

  // double click => rotate the piece
  // first click on piece => select it (to move or to rotate)
  // slow second click => move piece to clicked grid square
  const isDoubleClick = game.doubleClickFlag === this.id
  const isFirstClick =
    !game.selectedPlot || game.selectedPlot.index != this.id.split('_')[1]

  if (isDoubleClick) {
    game.rotatePlot(this.id)
  } else if (isFirstClick) {
    game.selectPlot(this.id)
    game.startDoubleClickTimer(this.id)
  } else {
    const clickedPlot = game.carrotPlots[this.id.split('_')[1]]
    const plotIndexes = Game._createIndexList(
      clickedPlot.row,
      clickedPlot.column,
      clickedPlot.size,
      clickedPlot.isVertical
    )
    const offset = event.target.id.split('_')[1]
    game.movePlot(`playerSquare_${plotIndexes[offset]}`)
    game.startDoubleClickTimer(this.id)
  }
  setupPhaseRender()
}

/** stops player from moving/rotating pieces */
const anchorCarrotLocations = () => {
  game.carrotPlots.forEach((plot) => {
    plot.element.removeEventListener('click', clickPlot)
    plot.element.classList.add('hidden')
  })
}

/** send a request to game object for AI to take a turn */
const promptGopherTurn = () => {
  if (!game.requestGopherShot()) {
    throw new Error('requested gopher turn out of phase')
  }
  gameplayRender()
}

/** process a player click on gopher grid */
const doPlayerTurn = (event) => {
  const isValidTarget = event.target.id.split('_')[0] === 'gopherSquare'
  if (!isValidTarget) {
    return
  }

  const engineAcceptedShot = game.registerPlayerShot(event.target.id)
  if (engineAcceptedShot) {
    setTimeout(promptGopherTurn, debugMode ? 100 : 800)
  }
  gameplayRender()
}

/**
 * Render method to be used during main gameplay phase.  
 * - mark missed and successful shots on both grids
 * - apply special mark to 'sunk' gopher dens
 * - check for winner
 */
const gameplayRender = () => {
  game.playerSquares.forEach((square) => {
    if (square.isMiss) {
      square.element.classList.add('gopherMiss')
    } else if (square.isHit) {
      square.element.classList.add('gopherHit')
    }
    //TODO would be a nice effect to style the whole plot differently if all squares have been hit
  })
  game.gopherSquares.forEach((square) => {
    if (square.isMiss) {
      square.element.classList.add('playerMiss')
    } else if (square.isHit) {
      square.element.classList.add('playerHit')
    }
  })

  // apply style to dead den squares
  game.gopherDens.forEach((den) => {
    if (den.isDead) {
      const indexesToMark = Game._createIndexList(
        den.row,
        den.column,
        den.size,
        den.isVertical
      )
      indexesToMark.forEach((index) => {
        game.gopherSquares[index].element.classList.add('deadDen')
        game.gopherSquares[index].element.classList.remove('playerHit')
      })
    }
  })

  // check for winner
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

/**
 * changes game state to enter main gameplay 
 * - locks player pieces in place
 * - change UI
 * - register listener for player shots
 */
const startGame = () => {
  anchorCarrotLocations()
  game.makeGopherDens([2, 3, 3, 4, 5])
  view.plotTray.classList.add('hidden')
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

/** shows start button if all pieces are on board */
const startButtonCheck = () => {
  const plotsInTray = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  if (plotsInTray.length === 0 && view.playButton === null) {
    view.playButton = document.createElement('button')
    view.playButton.textContent = 'Start Game'
    view.plotTray.appendChild(view.playButton)
    view.playButton.addEventListener('click', startGame)
  }
}

/**
 * render function for pre-game setup
 * - update location of pieces in UI
 * - display start button if needed
 * - highlight selected piece
 */
const setupPhaseRender = () => {
  // move plots to grid if they have been assigned a location
  let plotsToPlace = Array.from(plotTray.querySelectorAll('.carrotPlot'))
  plotsToPlace.forEach((plotElement) => {
    const plot = game.carrotPlots[plotElement.id.split('_')[1]]
    if (plot.row && plot.column) {
      plotTray.removeChild(plot.element)
      view.playerGrid.appendChild(plot.element)
    }
  })

  startButtonCheck()

  // update plot locations and styles according to data
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

/**
 * prepare interface on page load
 * - make squares for both grids (assign IDs)
 * - make a reset button
 * - generate player pieces
 * - register handler for placing player pieces
 */
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
    view.resetButton.addEventListener('click', reset)
  }

  //  TODO these carrotplot declarations should really be handled inside the game object
  //  Taking an array like pickGopherPlots would allow flexability for changing boat types
  game.addCarrotPlot(new CarrotPlot(2, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(3, game))
  game.addCarrotPlot(new CarrotPlot(4, game))
  game.addCarrotPlot(new CarrotPlot(5, game))
  for (const plot of game.carrotPlots) {
    view.plotTray.appendChild(plot.element)
    plot.element.addEventListener('click', clickPlot)
  }

  // clicking on player grid should place selected piece (if any)
  playerGrid.addEventListener('click', (event) => {
    if (!game.selectedPlot) {
      return
    }
    game.movePlot(event.target.id)
    setupPhaseRender()
  })
  setupPhaseRender()
}

/** reset game and UI state to setup phase */
const reset = () => {
  //TODO BUG reset doesn't clear the result div
  view.playerGrid.textContent = ''
  view.gopherGrid.textContent = ''
  view.plotTray.textContent = ''
  view.plotTray.classList.remove('hidden')
  view.gameResult.classList.add('hidden')
  view.playerWin.classList.add('hidden')
  view.gopherWin.classList.add('hidden')
  view.gopherGrid.removeEventListener('click', doPlayerTurn)
  view.playButton = null
  initialize()
}

initialize()

// run tests from tests.js if proper flag is set
if (runTests) {
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

// expose internal variables to browser if debug flag is set
if (debugMode) {
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
    game.makeGopherDens([2, 3, 3, 4, 5])
    window.showDens()
  }
}
