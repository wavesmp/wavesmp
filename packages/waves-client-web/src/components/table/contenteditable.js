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
    this.state = { editing: false }
  }

  shouldComponentUpdate(nextProps) {
    return (!this.state.editing &&
      htmlEscape(nextProps.html) !== this.spanRef.current.innerHTML)
  }

  componentDidUpdate() {
    const htmlEscaped = htmlEscape(this.props.html)
    if (htmlEscaped !== this.spanRef.current.innerHTML) {
      this.spanRef.current.innerHTML = htmlEscaped
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
    const html = htmlUnescape(this.spanRef.current.innerHTML.trim())
    if (html && html !== lastHtml) {
      this.props.onChange(html);
    }
    this.setState({ editing: false })
  }

  onFocus = () => {
    this.setState({ editing: true })
  }

  render() {
    const { editable, html } = this.props
    return (
      <span ref={this.spanRef}
            onBlur={this.emitChange}
            onFocus={this.onFocus}
            onKeyDown={this.onKeyDown}
            onMouseDown={this.onMouseDown}
            contentEditable={editable}
            spellCheck='false'
            dangerouslySetInnerHTML={{__html: htmlEscape(html)}}/>
    )
  }
}

// https://stackoverflow.com/questions/1219860/
// html-encoding-lost-when-attribute-read-from-input-field
// Quotes appear to be returned unescaped from innerHTML on
// Chrome, so they are not included in this list
function htmlEscape(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function htmlUnescape(str){
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
