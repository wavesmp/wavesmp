import React from 'react'

export default class Dropdown extends React.Component {
  onIconClick = () => {
    const { actions, dropdown, dropdownName } = this.props
    if (dropdown !== dropdownName) {
      actions.dropdownSet(dropdownName)
    }
  }

  renderDropdownHeader() {
    const { header } = this.props
    return (
      <React.Fragment>
        <li className='menubar-dropdown-header'>{header.text}<span className={header.classes}></span> </li>
        <li className='menubar-dropdown-divider'></li>
      </React.Fragment>
    )
  }

  renderDropdown() {
    const { items, header } = this.props
    return (
      <ul className='menubar-dropdown-menu'>
        {header && this.renderDropdownHeader()}
        {items && items.map(({text, classes, onClick}) => (
          <li>
            <a className='menubar-dropdown-link' href='javascript:'
               onClick={onClick}>
               {text}<span className={classes}/>
            </a>
          </li>
          ))}
      </ul>
    )
  }

  render() {
    const { iconClasses, dropdown, dropdownName } = this.props
    return (
      <div className='menubar-profile-link'>
        <a href='javascript:;' onClick={this.onIconClick}>
          <i className={iconClasses}></i>
        </a>
        { dropdown === dropdownName && this.renderDropdown() }
      </div>
    )
  }


}
