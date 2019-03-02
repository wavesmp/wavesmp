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

  renderDropdownHeader() {
    const { header } = this.props
    return (
      <React.Fragment>
        <li className='menubar-dropdown-header'>
          {header.text}
          <span className={header.classes} />{' '}
        </li>
        <li className='menubar-dropdown-divider' />
      </React.Fragment>
    )
  }

  renderDropdown() {
    const { items, header } = this.props
    return (
      <ul className='menubar-dropdown-menu'>
        {header && this.renderDropdownHeader()}
        {items &&
          items.map(({ text, classes, onClick }, i) => (
            <li key={i}>
              <a
                className='menubar-dropdown-link'
                href='javascript:'
                onClick={onClick}
              >
                {text}
                <span className={classes} />
              </a>
            </li>
          ))}
      </ul>
    )
  }

  render() {
    const { iconClasses, dropdown, dropdownName } = this.props
    return (
      <div
        className='menubar-profile-link'
        data-toggle={DROPDOWN_DATA_VALUE}
        onClick={this.onIconClick}
      >
        <a href='javascript:;'>
          <i className={iconClasses} />
        </a>
        {dropdown === dropdownName && this.renderDropdown()}
      </div>
    )
  }
}
