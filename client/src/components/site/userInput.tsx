import type { JSX } from "react";
import { memo } from "react";

import "./userInput.css";

interface UserInputProps {
  placeholder?: string;
  iconClass?: string;
}

const UserInput = memo(function UserInput(props: UserInputProps): JSX.Element {
  let iconClass =
    "fa fa-lg fa-fw common-tablemenubar-input-icon site-input-icon ";
  const { placeholder, iconClass: additionalIconClass } = props;
  if (additionalIconClass) {
    iconClass += additionalIconClass;
  }

  return (
    <div className="site-input-box">
      <i className={iconClass} />
      <input type="text" className="site-input" placeholder={placeholder} />
    </div>
  );
});

export { UserInput };
