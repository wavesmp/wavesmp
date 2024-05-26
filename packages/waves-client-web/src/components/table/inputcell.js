import React from 'react'

export default class InputCell extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = { value: props.value }
  }

  /* Focus and select input when it becomes editable */
  componentDidUpdate(prevProps) {
    const { editable } = this.props
    if (!prevProps.editable && editable) {
      this.inputRef.current.focus()
      this.inputRef.current.select()
    }
  }

  onKeyDown = (ev) => {
    const { key } = ev
    if (key === 'Enter') {
      this.inputRef.current.blur()
    }
  }

  onBlur = () => {
    const { value: lastValue, onBlur, onChange } = this.props
    const { value } = this.state
    if (value && value !== lastValue) {
      onChange(value)
    }
    onBlur()
  }

  onChange = (ev) => {
    const newValue = ev.currentTarget.value
    this.setState({ value: newValue })
  }

  render() {
    const { editable, title } = this.props
    if (editable) {
      const { value } = this.state
      return (
        <input
          ref={this.inputRef}
          className='table-input'
          type='text'
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          draggable={false}
          spellCheck='false'
          data-title={title}
          value={value}
          onChange={this.onChange}
        />
      )
    }
    const { value } = this.props
    return (
      <span draggable spellCheck='false' data-title={title}>
        {value}
      </span>
    )
  }
}
