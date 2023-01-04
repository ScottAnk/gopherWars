function clickGridEvent(index) {
  return {target:{id:`playerSquare_${index}`}}
}
export function placementOOBVertical(game, render) {
  //move the 5 piece plot to the bottom corner, forcing an adjustment to move up to row 6
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_99')
  console.log(
    `${
      game.carrotPlots[4].row === 6
        ? 'pass'
        : '!!!fail with ' + game.carrotPlots[4].row
    } - placementOOBVertical`
  )
  render()
}

export function placementOOBHorizontal(game, render) {
  //move the 5 piece plot to the 1st column, rotate, move to right column forcing an adjustment to column 6
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_10')
  game.carrotPlots[4].rotate()
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_19')
  console.log(
    `${
      game.carrotPlots[4].column === 6 && game.carrotPlots[4].row === 2
        ? 'pass' 
        : '!!!fail with ' + game.carrotPlots[4].row + ', ' + game.carrotPlots[4].column
    } - placementOOBVertical`
  )
  render()
}

export function rotateOOBHorizontal(game, render) {
  //move the 5 piece plot to the right column, rotate forcing an adjustment to column 6
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_59')
  game.carrotPlots[4].rotate()
  console.log(
    `${game.carrotPlots[4].column === 6
      ? 'pass'
      : '!!!fail with ' + game.carrotPlots[4].column
    } - rotateOOBHorizontal`
  )
  render()
}

export function rotateOOBVertical(game, render) {
  //move the 5 piece plot to the 1st column, rotate, move to bottom row, rotate forcing an adjustment to row 6
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_10')
  game.carrotPlots[4].rotate()
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_90')
  game.carrotPlots[4].rotate()
  console.log(
    `${game.carrotPlots[4].column === 1 && game.carrotPlots[4].row === 6 
      ? 'pass'
      : '!!!fail with ' + game.carrotPlots[4].column + ', ' + game.carrotPlots[4].row
    } - rotateOOBVertical`
  )
  render()
}

export function placementOverlappingVertical(game, render) {
  //move the 5 piece plot to the 1st column, rotate, move 2 piece plot to 3rd row causing collision and reject placement
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_30')
  game.carrotPlots[4].rotate()
  game.selectPlot('carrotPlot_0')
  game.movePlot('playerSquare_20')
  console.log(
    `${Number.isNaN(game.carrotPlots[0].column) && Number.isNaN(game.carrotPlots[0].row)
      ? 'pass'
      : '!!!fail with ' + ', ' + game.carrotPlots[0].column + ', ' + game.carrotPlots[0].row
    } - placementOverlappingVertical`
  )
  render()
}

export function placementOverlappingHorizontal(game, render) {
  //move the 5 piece plot to the 4th row, rotate, move 2 piece plot to 5th row, rotate, move to column 5 causing collision and reject move
  game.selectPlot('carrotPlot_4')
  game.movePlot('playerSquare_30')
  game.carrotPlots[4].rotate()

  game.selectPlot('carrotPlot_0')
  game.movePlot('playerSquare_40')
  game.carrotPlots[0].rotate()
  game.selectPlot('carrotPlot_0')
  game.movePlot('playerSquare_34')
  console.log(
    `${game.carrotPlots[0].column === 1 && game.carrotPlots[0].row === 5 
      ? 'pass'
      : '!!!fail with ' + ', ' + game.carrotPlots[0].column + ', ' + game.carrotPlots[0].row
    } - placementOverlappingHorizontal`
  )
  render()
}

export function clickToPlace(game, handler, render) {
  game.selectPlot('carrotPlot_4')
  handler(clickGridEvent(34))
  console.log(
    `${
      game.carrotPlots[4].column === 5 && game.carrotPlots[4].row === 4
      ? 'pass'
      : '!!!fail with ' + game.carrotPlots[4].row + ', ' + game.carrotPlots[4].column
    } - clickToPlace`
  )
}