/* Reorder tracks by relocating selected indexes to insertAt */
function reorder(tracks, indexToId, insertAt) {
  const n = tracks.length
  if (insertAt < 0 || insertAt > n) {
    throw new Error(`Reorder index ${insertAt} out of bounds`)
  }

  if (indexToId.size === 0) {
    return tracks
  }

  const indexes = [...indexToId.keys()].sort((a, b) => a - b)
  const firstIndex = indexes[0]
  const lastIndex = getLast(indexes)
  if (firstIndex < 0) {
    throw new Error(`Reorder index out of bounds: ${firstIndex}`)
  }
  if (lastIndex >= n) {
    throw new Error(`Reorder index out of bounds: ${lastIndex}`)
  }

  const firstStop = Math.min(insertAt, firstIndex)
  const reordered = []

  for (let i = 0; i < firstStop; i += 1) {
    reordered.push(tracks[i])
  }

  for (let i = firstStop; i < insertAt; i += 1) {
    if (!indexToId.has(i)) {
      reordered.push(tracks[i])
    }
  }

  for (const i of indexes) {
    reordered.push(tracks[i])
  }

  for (let i = insertAt; i < n; i += 1) {
    if (!indexToId.has(i)) {
      reordered.push(tracks[i])
    }
  }
  return reordered
}

function getLast(A) {
  return A[A.length - 1]
}

module.exports.reorder = reorder
