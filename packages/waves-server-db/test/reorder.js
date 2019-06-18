const { assert } = require('chai')

const { assertThrows } = require('waves-test-util')

const { reorder } = require('../reorder')

module.exports = () => {
  it('#reorder() insertAt too low', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 4, 6, 8]
    const insertAt = -1
    await assertThrows(
      'reorder',
      reorder,
      [tracks, selection, insertAt],
      `Error: Reorder index ${insertAt} out of bounds`
    )
  })

  it('#reorder() insertAt too high', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 4, 6, 8]
    const insertAt = 11
    await assertThrows(
      'reorder',
      reorder,
      [tracks, selection, insertAt],
      `Error: Reorder index ${insertAt} out of bounds`
    )
  })

  it('#reorder() selection index too low', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, -1, 6, 8]
    const sorted = selection.sort((a, b) => a - b)
    const insertAt = 0
    await assertThrows(
      'reorder',
      reorder,
      [tracks, selection, insertAt],
      `Error: Reorder selection out of bounds: ${sorted}`
    )
  })

  it('#reorder() selection index too high', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 10, 6, 8]
    const sorted = selection.sort((a, b) => a - b)
    const insertAt = 0
    await assertThrows(
      'reorder',
      reorder,
      [tracks, selection, insertAt],
      `Error: Reorder selection out of bounds: ${sorted}`
    )
  })

  it('#reorder() to start', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 4, 6, 8]
    const insertAt = 0
    const reordered = reorder(tracks, selection, insertAt)
    assert.deepEqual(reordered, [0, 2, 4, 6, 8, 1, 3, 5, 7, 9])
  })

  it('#reorder() to end', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 4, 6, 8]
    const insertAt = 10
    const reordered = reorder(tracks, selection, insertAt)
    assert.deepEqual(reordered, [1, 3, 5, 7, 9, 0, 2, 4, 6, 8])
  })

  it('#reorder() to middle', async () => {
    const tracks = [...Array(10).keys()]
    const selection = [0, 2, 4, 6, 8]
    const insertAt = 5
    const reordered = reorder(tracks, selection, insertAt)
    assert.deepEqual(reordered, [1, 3, 0, 2, 4, 6, 8, 5, 7, 9])
  })
}
