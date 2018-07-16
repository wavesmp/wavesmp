import React from 'react'

// TODO look into using sth like
// https://github.com/lovasoa/react-contenteditable/blob/master/src/react-contenteditable.js

// TODO refactor const
const ENTER_KEY_CODE = 13


/**
 * ContentEditable with React is shit
 * Based on:
 * http://stackoverflow.com/questions/22677931/
 * react-js-onchange-event-for-contenteditable
 */
export default class ContentEditable extends React.Component {
  constructor(props) {
    super(props)
    this.spanRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== this.spanRef.current.innerHTML
  }

  componentDidUpdate() {
    if (this.props.html !== this.spanRef.current.innerHTML) {
       this.spanRef.current.innerHTML = this.props.html
    }
  }

  onKeyDown = ev => {
    const { keyCode } = ev
    if (keyCode === ENTER_KEY_CODE) {
      this.spanRef.current.blur()
      ev.preventDefault()
      return
    }
  }

  /* Default span contentEdiable behavior focuses on the element.
   * Handle the focus in the parent instead. */
  onMouseDown = ev => {
    const clickTarget = ev.target
    if (document.activeElement !== clickTarget) {
      ev.preventDefault()
    }
  }

  emitChange = () => {
    const lastHtml = this.props.html.trim()
    const html = this.spanRef.current.innerHTML.trim()
    if (html && html !== lastHtml) {
      this.props.onChange(html);
    }
  }

  render() {
    const { editable, html } = this.props
    return (
      <span ref={this.spanRef}
            onBlur={this.emitChange}
            onKeyDown={this.onKeyDown}
            onMouseDown={this.onMouseDown}
            contentEditable={editable}
            spellCheck='false'
            dangerouslySetInnerHTML={{__html: html}}/>
    )
  }
}
