import React from 'react'

import ContentPage from '../contentpage'
import TableMenuBar from './tablemenubar'
import Table from '../table'
import './index.css'

export default class TablePage extends React.PureComponent {
  render() {
    const {
      title,
      sidebar,
      isPlayerVisible,
      transitions,
      ...other
    } = this.props
    return (
      <ContentPage
        title={title}
        sidebar={sidebar}
        isPlayerVisible={isPlayerVisible}
        transitions={transitions}
      >
        <TablePageData {...other} transitions={transitions} />
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
      playlistLoaded,
      numItems,
      ...other
    } = this.props

    if (!playlistLoaded) {
      return (
        <div className='tablepage-msg'>
          <i className='fa fa-spinner fa-pulse fa-5x' />
        </div>
      )
    }
    if (numItems === 0) {
      if (routerSearchString) {
        return (
          <div>
            <TableMenuBar
              buttons={buttons}
              pathname={pathname}
              qp={qp}
              routerSearchString={routerSearchString}
              onSettingsClick={onSettingsClick}
              history={history}
            />
            <div className='clearfix' />
            <h3 className='tablepage-msg'>No data</h3>
          </div>
        )
      }
      return <h3>{noDataMsg}</h3>
    }
    return (
      <React.Fragment>
        <TableMenuBar
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
