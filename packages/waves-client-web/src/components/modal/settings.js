import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as WavesActions from 'waves-client-actions'
import { ALL_COLUMNS, toastTypes } from 'waves-client-constants'
const COLUMN_NAME_ATTR = 'data-columnname'

import Modal from './util'
import './settings.css'

const TITLE = 'Account Settings'
const ACTION = 'Save'

class AccountSettingsModal extends React.PureComponent {
  constructor(props) {
    super(props)
    const { rowsPerPage, columns, theme } = this.props
    this.state = { rowsPerPage, columns, theme }
  }

  onAction = async () => {
    const { rowsPerPage, columns, theme } = this.state
    const { actions } = this.props
    actions.accountSetSettings(columns, rowsPerPage, theme)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Applied changes' })
    return true
  }

  onRowsPerPageChange = ev => {
    const rowsPerPage = parseInt(ev.target.value)
    this.setState({ rowsPerPage })
  }

  onThemeChange = ev => {
    const theme = ev.target.value
    this.setState({ theme })
  }

  addColumn = ev => {
    const columns = new Set(this.state.columns)
    const colToAdd = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.add(colToAdd)
    this.setState({ columns })
  }

  removeColumn = ev => {
    const columns = new Set(this.state.columns)
    const colToDelete = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.delete(colToDelete)
    this.setState({ columns })
  }

  render() {
    const { columns, rowsPerPage, theme } = this.state
    const { actions } = this.props
    const hiddenColumns = ALL_COLUMNS.filter(x => !columns.has(x))
    const activeColumns = ALL_COLUMNS.filter(x => columns.has(x))
    return (
      <Modal actions={actions} title={TITLE} actionTitle={ACTION} onAction={this.onAction}>
        <div>
          <div className='modal-settings-columns'>
            <div className='modal-settings-column'>
              <label>Hidden Columns</label>
              <ul className='modal-settings-list'>
                {hiddenColumns.map((sample, index) => (
                  <li
                    key={sample}
                    className='modal-settings-list-item'
                    data-columnname={sample}
                    onClick={this.addColumn}
                  >
                    <i className='fa fa-lg fa-plus modal-settings-add-icon' />
                    &nbsp;&nbsp;{sample}
                  </li>
                ))}
              </ul>
            </div>
            <div className='modal-settings-column'>
              <label>Active Columns</label>
              <ul className='modal-settings-list'>
                {activeColumns.map((sample, index) => (
                  <li
                    key={sample}
                    className='modal-settings-list-item'
                    data-columnname={sample}
                    onClick={this.removeColumn}
                  >
                    <i className='fa fa-lg fa-times modal-settings-del-icon' />
                    &nbsp;&nbsp;{sample}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='modal-settings-columns'>
            <div className='modal-settings-column'>
              <label>Theme:</label>
              <div className='modal-settings-select-width'>
                <select
                  value={theme}
                  onChange={this.onThemeChange}
                  className='form-input'
                >
                  <option value='light'>Light</option>
                  <option value='dark'>Dark</option>
                </select>
              </div>
            </div>
            <div className='modal-settings-column'>
              <label>Rows Per Page:</label>
              <div className='modal-settings-select-width'>
                <select
                  value={rowsPerPage}
                  onChange={this.onRowsPerPageChange}
                  className='form-input'
                >
                  <option value='10'>10</option>
                  <option value='25'>25</option>
                  <option value='50'>50</option>
                  <option value='100'>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    columns: state.account.columns,
    rowsPerPage: state.account.rowsPerPage,
    theme: state.account.theme
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(WavesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountSettingsModal)
