const { assert } = require('chai')

const { assertThrows } = require('waves-test-util')

const { reorder } = require('../reorder')

module.exports = () => {
  describe('Reorder method', async () => {
    it('insertAt too low', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 4, 6, 8])
      const insertAt = -1
      await assertThrows(
        'reorder',
        reorder,
        [tracks, indexToId, insertAt],
        `Error: Reorder index ${insertAt} out of bounds`
      )
    })

    it('insertAt too high', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 4, 6, 8])
      const insertAt = 11
      await assertThrows(
        'reorder',
        reorder,
        [tracks, indexToId, insertAt],
        `Error: Reorder index ${insertAt} out of bounds`
      )
    })

    it('indexToId index too low', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, -1, 6, 8])
      const insertAt = 0
      await assertThrows(
        'reorder',
        reorder,
        [tracks, indexToId, insertAt],
        'Error: Reorder index out of bounds: -1'
      )
    })

    it('indexToId index too high', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 10, 6, 8])
      const insertAt = 0
      await assertThrows(
        'reorder',
        reorder,
        [tracks, indexToId, insertAt],
        'Error: Reorder index out of bounds: 10'
      )
    })

    it('to start', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 4, 6, 8])
      const insertAt = 0
      const reordered = reorder(tracks, indexToId, insertAt)
      assert.deepEqual(reordered, [0, 2, 4, 6, 8, 1, 3, 5, 7, 9])
    })

    it('to end', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 4, 6, 8])
      const insertAt = 10
      const reordered = reorder(tracks, indexToId, insertAt)
      assert.deepEqual(reordered, [1, 3, 5, 7, 9, 0, 2, 4, 6, 8])
    })

    it('to middle', async () => {
      const tracks = [...Array(10).keys()]
      const indexToId = getIndexToId([0, 2, 4, 6, 8])
      const insertAt = 5
      const reordered = reorder(tracks, indexToId, insertAt)
      assert.deepEqual(reordered, [1, 3, 0, 2, 4, 6, 8, 5, 7, 9])
    })
  })
}

function getIndexToId(A) {
  return new Map(A.map(e => [e, e]))
}
