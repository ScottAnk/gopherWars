function clickGridEvent(index) {
  return { target: { id: `playerSquare_${index}` } }
}

function clickPlotEvent(index) {
  return {
    target: { id: `carrotSquare_${index}` },
    stopPropagation() {},
  }
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
        : '!!!fail with ' +
          game.carrotPlots[4].row +
          ', ' +
          game.carrotPlots[4].column
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
    `${
      game.carrotPlots[4].column === 6
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
    `${
      game.carrotPlots[4].column === 1 && game.carrotPlots[4].row === 6
        ? 'pass'
        : '!!!fail with ' +
          game.carrotPlots[4].column +
          ', ' +
          game.carrotPlots[4].row
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
    `${
      Number.isNaN(game.carrotPlots[0].column) &&
      Number.isNaN(game.carrotPlots[0].row)
        ? 'pass'
        : '!!!fail with ' +
          ', ' +
          game.carrotPlots[0].column +
          ', ' +
          game.carrotPlots[0].row
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
    `${
      game.carrotPlots[0].column === 1 && game.carrotPlots[0].row === 5
        ? 'pass'
        : '!!!fail with ' +
          ', ' +
          game.carrotPlots[0].column +
          ', ' +
          game.carrotPlots[0].row
    } - placementOverlappingHorizontal`
  )

  render()
}

export function clickToPlace(game, handler) {
  game.selectPlot('carrotPlot_4')
  handler(clickGridEvent(34))

  console.log(
    `${
      game.carrotPlots[4].column === 5 && game.carrotPlots[4].row === 4
        ? 'pass'
        : '!!!fail with ' +
          game.carrotPlots[4].row +
          ', ' +
          game.carrotPlots[4].column
    } - clickToPlace`
  )
}

export function clickToPlaceCollision(game, gridHandler, plotHandler) {
  const plotIndex1 = 1
  const plotIndex2 = 2
  const clickPlot1 = plotHandler.bind(game.carrotPlots[plotIndex1].element)
  const clickPlot2 = plotHandler.bind(game.carrotPlots[plotIndex2].element)

  clickPlot1(clickPlotEvent(plotIndex1))
  gridHandler(clickGridEvent(10))
  clickPlot2(clickPlotEvent(plotIndex2))
  gridHandler(clickGridEvent(20))
  const halfwayResult = game.carrotPlots[plotIndex2].row

  clickPlot2(clickPlotEvent(plotIndex2))
  gridHandler(clickGridEvent(21))
  clickPlot2(clickPlotEvent(plotIndex2))
  gridHandler(clickGridEvent(20))
  const finalResultRow = game.carrotPlots[plotIndex2].row
  const finalResultColumn = game.carrotPlots[plotIndex2].column

  console.log(
    `${
      Number.isNaN(halfwayResult) &&
      finalResultRow === 3 &&
      finalResultColumn === 2
        ? 'pass'
        : '!!!fail with ' +
          halfwayResult +
          ', ' +
          finalResultRow +
          ', ' +
          finalResultColumn
    } - clickToPlaceCollision`
  )
}

export function doubleClickToRotate(game, gridHandler, plotHandler) {
  const plotIndex1 = 1
  const clickPlot1 = plotHandler.bind(game.carrotPlots[plotIndex1].element)

  clickPlot1(clickPlotEvent(plotIndex1))
  gridHandler(clickGridEvent(10))
  clickPlot1(clickPlotEvent(plotIndex1))
  clickPlot1(clickPlotEvent(plotIndex1))

  console.log(
    `${
      game.carrotPlots[1].column === 1 &&
      game.carrotPlots[1].row === 2 &&
      !game.carrotPlots[1].isVertical
        ? 'pass'
        : '!!!fail with ' +
          game.carrotPlots[1].row +
          ', ' +
          game.carrotPlots[1].column +
          ', ' +
          game.carrotPlots[1].isVertical
    } - doubleClickToRotate`
  )
}

export function doubleClickToRotateCollision(game, gridHandler, plotHandler) {
  const plotIndex1 = 1
  const plotIndex2 = 2
  const clickPlot1 = plotHandler.bind(game.carrotPlots[plotIndex1].element)
  const clickPlot2 = plotHandler.bind(game.carrotPlots[plotIndex2].element)

  clickPlot1(clickPlotEvent(plotIndex1))
  gridHandler(clickGridEvent(10))
  clickPlot2(clickPlotEvent(plotIndex2))
  gridHandler(clickGridEvent(11))
  clickPlot1(clickPlotEvent(plotIndex1))
  clickPlot1(clickPlotEvent(plotIndex1))

  console.log(
    `${
      game.carrotPlots[1].column === 1 &&
      game.carrotPlots[1].row === 2 &&
      game.carrotPlots[1].isVertical
        ? 'pass'
        : '!!!fail with ' +
          game.carrotPlots[1].row +
          ', ' +
          game.carrotPlots[1].column +
          ', ' +
          game.carrotPlots[1].isVertical
    } - doubleClickToRotateCollision`
  )
}

export function placeAllPlots (game, gridHandler, plotHandler) {
  const plotIndex1 = 0
  const plotIndex2 = 1
  const plotIndex3 = 2
  const plotIndex4 = 3
  const plotIndex5 = 4
  const clickPlot1 = plotHandler.bind(game.carrotPlots[plotIndex1].element)
  const clickPlot2 = plotHandler.bind(game.carrotPlots[plotIndex2].element)
  const clickPlot3 = plotHandler.bind(game.carrotPlots[plotIndex3].element)
  const clickPlot4 = plotHandler.bind(game.carrotPlots[plotIndex4].element)
  const clickPlot5 = plotHandler.bind(game.carrotPlots[plotIndex5].element)

  clickPlot1(clickPlotEvent(plotIndex1))
  gridHandler(clickGridEvent(10))
  clickPlot2(clickPlotEvent(plotIndex2))
  gridHandler(clickGridEvent(11))
  clickPlot3(clickPlotEvent(plotIndex3))
  gridHandler(clickGridEvent(12))
  clickPlot4(clickPlotEvent(plotIndex4))
  gridHandler(clickGridEvent(13))
  clickPlot5(clickPlotEvent(plotIndex5))
  gridHandler(clickGridEvent(14))
}