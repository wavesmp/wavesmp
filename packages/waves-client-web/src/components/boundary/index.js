import React from 'react'

export default class Boundary extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { err: null, errInfo: null }
  }

  componentDidCatch(err, errInfo) {
    this.setState({ err, errInfo })
  }

  render() {
    const { children } = this.props
    /* eslint-disable-next-line react/destructuring-assignment */
    const err = this.props.err || this.state.err
    if (err) {
      const { errInfo } = this.state
      const errStack = (errInfo && errInfo.componentStack) || err.stack
      return (
        <div className='main-err-container absolute-center'>
          <div className='main-err-sign'>
            <i className='fa fa-exclamation-circle main-err-icon danger' />
            <div className='main-err-text'>
              <h1 className='main-err-title'>Oops...</h1>
              <h4>Something went wrong. Try again later.</h4>
            </div>
          </div>
          <details className='pre-wrap'>
            {`${err}`}
            <br />
            {errStack}
          </details>
        </div>
      )
    }
    return children
  }
}
