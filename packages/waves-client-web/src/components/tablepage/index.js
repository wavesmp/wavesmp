import React from 'react'

import ContentPage from '../contentpage'
import TableBar from '../tablebar'
import Table from '../table'
import './index.css'

export default class TablePage extends React.PureComponent {
  render() {
    const { title, ...other } = this.props
    return (
      <ContentPage title={title}>
        <TablePageData {...other} />
      </ContentPage>
    )
  }
}

class TablePageData extends React.PureComponent {
  render() {
    const {
      noDataMsg,
      buttons,
      pathname,
      qp,
      routerSearchString,
      onSettingsClick,
      history,
      loaded,
      numItems,
      ...other
    } = this.props

    if (!loaded) {
      const numRows = 8
      const rows = Array(numRows)
      for (let i = 0; i < numRows; i += 1) {
        rows[i] = (
          <div key={i} className='shelf-row'>
            <div className='shelf shelf-cell shelf-cell-lg' />
            <div className='shelf shelf-cell' />
            <div className='shelf shelf-cell' />
          </div>
        )
      }
      return (
        <div>
          <div className='tablebar'>
            <div>
              <div className='shelf shelf-btn' />
              <div className='shelf shelf-btn' />
            </div>
            <div className='shelf shelf-search-box' />
          </div>
          <div className='table'>{rows}</div>
        </div>
      )
    }
    if (numItems === 0) {
      if (routerSearchString) {
        return (
          <div>
            <TableBar
              buttons={buttons}
              pathname={pathname}
              qp={qp}
              routerSearchString={routerSearchString}
              onSettingsClick={onSettingsClick}
              history={history}
            />
            <h3 className='tablepage-msg'>No data</h3>
          </div>
        )
      }
      return <h3 className='tablepage-msg'>{noDataMsg}</h3>
    }
    return (
      <React.Fragment>
        <TableBar
          buttons={buttons}
          pathname={pathname}
          qp={qp}
          routerSearchString={routerSearchString}
          onSettingsClick={onSettingsClick}
          history={history}
        />
        <Table {...other} pathname={pathname} qp={qp} numItems={numItems} />
      </React.Fragment>
    )
  }
}
