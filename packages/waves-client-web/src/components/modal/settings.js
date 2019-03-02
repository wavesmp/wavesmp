import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { ModalHeader, ModalFooter, ModalWrapper } from './util'

import * as WavesActions from 'waves-client-actions'
import { ALL_COLUMNS, toastTypes } from 'waves-client-constants'
const COLUMN_NAME_ATTR = 'data-columnname'

const TITLE = 'Account Settings'
const ACTION = 'Save'

class AccountSettingsModal extends React.PureComponent {
  constructor(props) {
    super(props)
    const { rowsPerPage, theme } = this.props
    const columns = new Set(this.props.columns)
    this.state = { rowsPerPage, columns, theme }
  }

  onClose = () => {
    const { actions } = this.props
    actions.modalSet(null)
  }

  onAction = () => {
    const { rowsPerPage, columns, theme } = this.state
    const { actions } = this.props
    actions.accountSetSettings(columns, rowsPerPage, theme)
    actions.toastAdd({ type: toastTypes.Success, msg: 'Applied changes' })
    this.onClose()
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
    const { columns } = this.state
    const colToAdd = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.add(colToAdd)
    this.setState({ columns })
  }

  removeColumn = ev => {
    const { columns } = this.props
    const colToDelete = ev.currentTarget.getAttribute(COLUMN_NAME_ATTR)
    columns.delete(colToDelete)
    this.setState({ columns })
  }

  render() {
    const { columns, rowsPerPage, theme } = this.state
    const hiddenColumns = ALL_COLUMNS.filter(x => !columns.has(x))
    const activeColumns = ALL_COLUMNS.filter(x => columns.has(x))
    return (
      <ModalWrapper>
        <ModalHeader title={TITLE} onClose={this.onClose} />

        <div className='modal-body'>
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '50%', marginLeft: '25px' }}>
                <label style={{ marginTop: '6px' }}>Hidden Columns</label>
                <ul className='menubar-settings-list'>
                  {hiddenColumns.map((sample, index) => (
                    <li
                      key={sample}
                      className='menubar-settings-list-item'
                      data-columnname={sample}
                      onClick={this.addColumn}
                    >
                      <i
                        style={{ color: '#19B698' }}
                        className='fa fa-lg fa-plus'
                      />
                      &nbsp;&nbsp;{sample}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ width: '50%', marginLeft: '25px' }}>
                <label style={{ marginTop: '6px' }}>Active Columns</label>
                <ul className='menubar-settings-list'>
                  {activeColumns.map((sample, index) => (
                    <li
                      key={sample}
                      className='menubar-settings-list-item'
                      data-columnname={sample}
                      onClick={this.removeColumn}
                    >
                      <i
                        style={{ color: '#C11313' }}
                        className='fa fa-lg fa-times'
                      />
                      &nbsp;&nbsp;{sample}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '50%', marginLeft: '25px' }}>
                <label>Theme:</label>
                <div style={{ width: '25%' }}>
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
              <div style={{ width: '50%', marginLeft: '25px' }}>
                <label>Rows Per Page:</label>
                <div style={{ width: '25%' }}>
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
        </div>

        <ModalFooter
          actionTitle={ACTION}
          onAction={this.onAction}
          onClose={this.onClose}
        />
      </ModalWrapper>
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
