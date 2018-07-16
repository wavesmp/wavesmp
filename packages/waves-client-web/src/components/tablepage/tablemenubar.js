import React from 'react'

import Buttons from './buttons'
import './tablemenubar.css'

const ENTER_KEY_CODE = 13

export default class TableMenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchValue: ''};
  }

  onChange = ev => {
    this.setState({ searchValue: ev.currentTarget.value })
  }

  onKeyDown = ev => {
    const { keyCode } = ev
    if (keyCode !== ENTER_KEY_CODE) {
      return
    }

    const { history, location } = this.props
    const { pathname, search } = location
    const qp = new URLSearchParams(search)
    qp.set('page', 0)
    qp.set('search', ev.currentTarget.value)
    history.push({ pathname, search: `${qp}` })
    this.setState({ searchValue: '' })
  }

  render() {
    const { buttons, location, onSettingsClick,
            history, routerSearchString } = this.props
    let settingsComponent = null
    if (onSettingsClick) {
      settingsComponent = <i className='fa fa-lg fa-cog' onClick={onSettingsClick}/>
    }

    return (
      <div style={{marginBottom: '0px'}} className='tablemenubar'>
        <div>
          <Buttons buttons={buttons}/>
          <div className='pull-right tablemenubar-search-box'>
            {settingsComponent}
            <i className='fa fa-lg fa-search tablemenubar-input-icon'
               style={{position: 'relative',
                       top: '0px',
                       left: '25px'}}></i>
            <input type='text'
                   value={this.state.searchValue}
                   style={{paddingLeft: '30px'}}
                   placeholder={routerSearchString}
                   onKeyDown={this.onKeyDown}
                   onChange={this.onChange}/>
          </div>
        </div>
      </div>
    )
  }
}
