import type { ChangeEvent, JSX, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

interface InputCellProps {
  editable: boolean;
  title?: string;
  value: string | null | undefined;
  onBlur?: () => void;
  onChange: (update: string) => void;
}

/* Not memoized, matching the original React.Component (not PureComponent) */
function InputCell({
  editable,
  title,
  value: lastValue,
  onBlur: propsOnBlur,
  onChange: propsOnChange,
}: InputCellProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(lastValue ?? "");

  /* Focus and select input when it becomes editable */
  const wasEditable = useRef(editable);
  useEffect(() => {
    if (!wasEditable.current && editable) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    wasEditable.current = editable;
  }, [editable]);

  function onKeyDown(ev: KeyboardEvent<HTMLInputElement>): void {
    if (ev.key === "Enter") {
      inputRef.current?.blur();
    }
  }

  function onBlur(): void {
    if (value && value !== lastValue) {
      propsOnChange(value);
    }
    propsOnBlur?.();
  }

  function onChange(ev: ChangeEvent<HTMLInputElement>): void {
    setValue(ev.currentTarget.value);
  }

  if (editable) {
    return (
      <input
        ref={inputRef}
        className="table-input"
        type="text"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        draggable={false}
        spellCheck="false"
        data-title={title}
        value={value}
        onChange={onChange}
      />
    );
  }
  return (
    <span draggable spellCheck="false" data-title={title}>
      {lastValue}
    </span>
  );
}

export { InputCell };
