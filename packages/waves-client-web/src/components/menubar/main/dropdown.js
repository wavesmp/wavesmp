import React from 'react'

import { DROPDOWN_DATA_VALUE } from 'waves-client-constants'

export default class Dropdown extends React.PureComponent {
  onIconClick = () => {
    const { actions, dropdown, dropdownName } = this.props
    if (dropdown === dropdownName) {
      actions.dropdownSet(null)
    } else {
      actions.dropdownSet(dropdownName)
    }
  }

  renderDropdown() {
    const { items, headerText, headerClass } = this.props
    return (
      <ul className='menubar-dropdown-menu'>
        <li className='menubar-dropdown-header'>
          {headerText}
          <i className={headerClass} />
        </li>
        <li className='menubar-dropdown-divider' />
        {items &&
          items.map(({ text, classes, onClick }, i) => (
            <li key={i}>
              <div className='menubar-dropdown-item' onClick={onClick}>
                {text}
                <i className={classes} />
              </div>
            </li>
          ))}
      </ul>
    )
  }

  render() {
    const { iconClasses, dropdown, dropdownName } = this.props
    return (
      <div
        className='menubar-dropdown-icon-container'
        data-toggle={DROPDOWN_DATA_VALUE}
        onClick={this.onIconClick}
      >
        <i className={iconClasses} />
        {dropdown === dropdownName && this.renderDropdown()}
      </div>
    )
  }
}
