import React from 'react'

// TODO refactor const
const ENTER_KEY_CODE = 13

/**
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
    return (
      (this.props.editable !== nextProps.editable) ||
      (!nextProps.editable &&
       htmlEscape(nextProps.html) !== this.spanRef.current.innerHTML))
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.editable && this.props.editable) {
      this.spanRef.current.focus()
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

  onBlur = () => {
    const lastHtml = this.props.html.trim()
    const html = htmlUnescape(this.spanRef.current.innerHTML.trim())
    if (html && html !== lastHtml) {
      this.props.onChange(html);
    }
    this.props.onBlur()
  }

  render() {
    const { editable, html, title } = this.props
    return (
      <span ref={this.spanRef}
            onBlur={this.onBlur}
            onKeyDown={this.onKeyDown}
            contentEditable={editable}
            draggable={!editable}
            spellCheck='false'
            data-title={title}
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
