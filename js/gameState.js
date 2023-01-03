export class Game {
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