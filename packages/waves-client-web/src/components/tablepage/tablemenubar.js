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
          className='fa fa-lg fa-cog'
          onClick={onSettingsClick}
          style={{ position: 'absolute', top: '5px', left: '-30px' }}
        />
      )
    }

    return (
      <div style={{ marginBottom: '0px' }} className='tablemenubar'>
        <Buttons buttons={buttons} />
        <div className='pull-right tablemenubar-search-box'>
          {settingsComponent}
          <i
            className='fa fa-lg fa-search tablemenubar-input-icon'
            style={{ position: 'absolute', top: '5px', left: '6px' }}
          />
          <input
            type='text'
            value={this.state.searchValue}
            style={{ paddingLeft: '30px', paddingRight: '25px' }}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
          />
          {this.state.searchValue && (
            <i
              className='fa fa-lg fa-times tablemenubar-input-icon'
              onClick={this.onSearchReset}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                cursor: 'pointer'
              }}
            />
          )}
        </div>
      </div>
    )
  }
}
