//cache DOM objects
const view = {
  playerGrid: document.querySelector('#playerGrid'),
  gopherGrid: document.querySelector('#gopherGrid'),
  plotTray: document.querySelector('#plotTray'),
  playButton: document.querySelector('#playButton'),
  carrotSquares: [],
  gopherSquares: [],
}

//state object
let game = {}

class Game {
  constructor() {}
  
  render () {
    if (view.plotTray.childElementCount === 1) {
      view.playButton.classList.add('visible')
      view.playButton.classList.remove('hidden')
    }
  }
}

const initialize = () => {
  game = new Game()
  for (let i = 0; i < 100; i++) {
    const playerSquare = document.createElement('div')
    playerSquare.className = 'playerSquare gridSquare'
    playerSquare.id = `playerSquare ${i}`
    view.carrotSquares.push(playerSquare)
    view.playerGrid.appendChild(playerSquare)

    const gopherSquare = document.createElement('div')
    gopherSquare.className = 'gopherSquare gridSquare'
    gopherSquare.id = `gopherSquare ${i}`
    view.gopherGrid.appendChild(gopherSquare)
  }
  game.render()
}
initialize()


