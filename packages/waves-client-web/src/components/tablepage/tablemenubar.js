import React from 'react'

import Buttons from './buttons'
import './tablemenubar.css'

export default class TableMenuBar extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { searchValue: props.routerSearchString }
  }

  onChange = ev => {
    this.setState({ searchValue: ev.currentTarget.value })
  }

  onKeyDown = ev => {
    const { key } = ev
    if (key !== 'Enter') {
      return
    }
    this.applySearchFilter(ev.currentTarget.value)
  }

  onSearchReset = () => {
    this.setState({ searchValue: '' })
    this.applySearchFilter('')
  }

  applySearchFilter(searchString) {
    const { history, pathname } = this.props
    let { qp } = this.props
    qp = new URLSearchParams(qp)
    qp.set('page', 0)
    qp.set('search', searchString)
    history.push({ pathname, search: `${qp}` })
  }

  render() {
    const { buttons, onSettingsClick, history } = this.props
    let settingsComponent = null
    if (onSettingsClick) {
      settingsComponent = (
        <i
          className='fa fa-lg fa-cog tablemenubar-cog-icon'
          onClick={onSettingsClick}
        />
      )
    }

    return (
      <div className='tablemenubar'>
        <Buttons buttons={buttons} />
        <div className='pull-right tablemenubar-search-box'>
          {settingsComponent}
          <i className='fa fa-lg fa-search tablemenubar-search-icon' />
          <input
            className='tablemenubar-input'
            type='text'
            value={this.state.searchValue}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
          />
          {this.state.searchValue && (
            <i
              className='fa fa-lg fa-times tablemenubar-reset-icon'
              onClick={this.onSearchReset}
            />
          )}
        </div>
      </div>
    )
  }
}
