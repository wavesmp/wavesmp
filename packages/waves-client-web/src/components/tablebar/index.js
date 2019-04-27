import React from 'react'

import Buttons from './buttons'
import './index.css'

export default class TableBar extends React.PureComponent {
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
          className='fa fa-lg fa-cog tablebar-cog-icon'
          onClick={onSettingsClick}
        />
      )
    }

    return (
      <div className='tablebar'>
        <Buttons buttons={buttons} />
        <div className='pull-right tablebar-search-box'>
          {settingsComponent}
          <i className='fa fa-lg fa-search tablebar-search-icon' />
          <input
            className='tablebar-input'
            type='text'
            value={this.state.searchValue}
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
          />
          {this.state.searchValue && (
            <i
              className='fa fa-lg fa-times tablebar-reset-icon'
              onClick={this.onSearchReset}
            />
          )}
        </div>
      </div>
    )
  }
}
