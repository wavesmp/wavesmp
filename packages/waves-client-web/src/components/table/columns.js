import React from 'react'

import { Name, State, Time, Artist, Album, Genre } from './rows'

/*  TODO integrate common-columns-small-screen-hide
 *       with displayed columns in localstorage */
/* TODO refer to attribute in TrackInfoUpdate or refactor into constants */
export const playlistColumns = [
  {
    title: 'Name',
    attribute: 'title',
    Component: Name
  },
  {
    title: 'State',
    attribute: 'FIXME',
    Component: State
  },
  {
    title: 'Time',
    attribute: 'time',
    Component: Time
  },
  {
    title: 'Artist',
    attribute: 'artist',
    Component: Artist
  },
  {
    title: 'Album',
    attribute: 'album',
    Component: Album
  },
  {
    title: 'Genre',
    attribute: 'genre',
    Component: Genre
  }
]
export const libraryColumns = clonePlaylistColumns()
libraryColumns.forEach(column => { column.sortable = true })

// TODO consider using jquery func
function clonePlaylistColumns() {
  const clonedColumns = []
  for (let i = 0; i < playlistColumns.length; i += 1) {
    clonedColumns.push({...playlistColumns[i]})
  }
  return clonedColumns
}

