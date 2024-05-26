function reorder(playlist, filteredSelection, insertAt) {
  const { tracks, selection, index } = playlist
  const filteredSelectionKeys = Array.from(filteredSelection.keys()).sort(
    (a, b) => a - b,
  )
  const reordered = []
  const newSelection = new Map()
  let newIndex = null
  let indexOffset = 0

  /* Section before filtered selection or insertAt is preserved.
   * Filtered selection has at least one item due to drag n drop logic */
  const firstStop = Math.min(insertAt, filteredSelectionKeys[0])
  let i = 0
  while (i < firstStop) {
    const track = tracks[i]
    if (selection.has(i)) {
      newSelection.set(i, track)
    }
    reordered.push(track)
    i += 1
  }

  while (i < insertAt) {
    if (filteredSelection.has(i)) {
      if (index != null && index > i && index < insertAt) {
        indexOffset -= 1
      }
    } else {
      const track = tracks[i]
      if (selection.has(i)) {
        newSelection.set(i, track)
      }
      reordered.push(track)
    }
    i += 1
  }

  for (const j of filteredSelectionKeys) {
    const track = filteredSelection.get(j)
    if (j === index) {
      newIndex = reordered.length
    }
    newSelection.set(reordered.length, track)
    reordered.push(track)
  }

  const filteredSelectionStop = getLast(filteredSelectionKeys)
  while (i <= filteredSelectionStop) {
    if (filteredSelection.has(i)) {
      if (index != null && index < i && index >= insertAt) {
        indexOffset += 1
      }
    } else {
      const track = tracks[i]
      if (selection.has(i)) {
        newSelection.set(i, track)
      }
      reordered.push(track)
    }
    i += 1
  }

  while (i < tracks.length) {
    const track = tracks[i]
    if (selection.has(i)) {
      newSelection.set(i, track)
    }
    reordered.push(track)
    i += 1
  }

  if (newIndex == null && index != null) {
    newIndex = index + indexOffset
  }

  return { reordered, newSelection, newIndex }
}

function getLast(A) {
  return A[A.length - 1]
}

module.exports.reorder = reorder
