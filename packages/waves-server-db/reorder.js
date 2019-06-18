/* Reorder tracks by relocating selected indexes to insertAt */
function reorder(tracks, selection, insertAt) {
  const n = tracks.length
  if (insertAt < 0 || insertAt > n) {
    throw new Error(`Reorder index ${insertAt} out of bounds`)
  }

  if (selection.length === 0) {
    return
  }

  selection.sort((a, b) => a - b)
  if (selection[0] < 0 || getLast(selection) >= n) {
    throw new Error(`Reorder selection out of bounds: ${selection}`)
  }

  const selectionSet = new Set(selection)

  const firstStop = Math.min(insertAt, selection[0])
  const reordered = []

  for (let i = 0; i < firstStop; i += 1) {
    reordered.push(tracks[i])
  }

  for (let i = firstStop; i < insertAt; i += 1) {
    if (!selectionSet.has(i)) {
      reordered.push(tracks[i])
    }
  }

  for (const i of selection) {
    reordered.push(tracks[i])
  }

  for (let i = insertAt; i < n; i += 1) {
    if (!selectionSet.has(i)) {
      reordered.push(tracks[i])
    }
  }
  return reordered
}

function getLast(A) {
  return A[A.length - 1]
}

module.exports.reorder = reorder
