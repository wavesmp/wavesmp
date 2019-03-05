import React from 'react'

import { Name, State, Time, Artist, Album, Genre, CreatedAt } from './rows'

/*  TODO integrate common-columns-small-screen-hide
 *       with displayed columns in localstorage */
export const playlistColumns = [
  {
    title: 'Name',
    attribute: 'title',
    Component: Name
  },
  {
    title: 'State',
    Component: State
  },
  {
    title: 'Time',
    attribute: 'duration',
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
  },
  {
    title: 'Created At',
    attribute: 'createdAt',
    Component: CreatedAt
  }
]

export const libraryColumns = playlistColumns.map(col => ({...col, sortable: !!col.attribute}))
