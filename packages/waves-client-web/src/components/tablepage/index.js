import React from 'react'

import ContentPage from '../contentpage'
import TableMenuBar from './tablemenubar'
import Table from '../table'

export default class TablePage extends React.Component {
  render() {
    const { title, sidebar, isPlayerVisible,
            transitions, ...other } = this.props
    return (
      <ContentPage
          title={title} sidebar={sidebar} isPlayerVisible={isPlayerVisible}
          transitions={transitions}>
        <TablePageData {...other} transitions={transitions}/>
      </ContentPage>
    )
  }
}

class TablePageData extends React.Component {
  render() {
    const { noDataMsg, buttons, location, routerSearchString,
            onSettingsClick, history, playlistLoaded,
            numItems, ...other } = this.props

    if (!playlistLoaded) {
      return (
        <p style={{marginTop: '100px', marginBottom: '100px', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-pulse fa-5x"></i>
        </p>
      )
    }
    if (numItems === 0) {
      return (
        <h3 style={{marginTop: '100px', marginBottom: '100px', textAlign: 'center'}}>
          {noDataMsg}
        </h3>
      )
    }
    return (
      <React.Fragment>
        <TableMenuBar buttons={buttons}
                      location={location}
                      routerSearchString={routerSearchString}
                      onSettingsClick={onSettingsClick}
                      history={history}/>
        <Table {...other} location={location}
                          numItems={numItems}/>
      </React.Fragment>
    )
  }
}
