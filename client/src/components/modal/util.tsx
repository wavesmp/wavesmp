import type { ChangeEvent, JSX, ReactNode } from "react";
import { memo } from "react";

import { MODAL_DATA_VALUE } from "src/constants";
import type { BoundActions } from "src/providers/dispatcher";

/* Returns whether to close the modal */
type ModalHandler = () => boolean | Promise<boolean>;

interface ModalProps {
  actions: BoundActions;
  title: string;
  disabled?: boolean;
  actionTitle?: string;
  onAction?: ModalHandler;
  deleteTitle?: string;
  onDelete?: ModalHandler;
  children?: ReactNode;
}

const Modal = memo(function Modal(props: ModalProps): JSX.Element {
  const onClose = (): void => {
    const { actions } = props;
    actions.modalSet(null);
  };

  const { onAction: propsOnAction, onDelete: propsOnDelete } = props;

  const onAction = propsOnAction
    ? async (): Promise<void> => {
        if (await propsOnAction()) {
          onClose();
        }
      }
    : undefined;

  const onDelete = propsOnDelete
    ? async (): Promise<void> => {
        if (await propsOnDelete()) {
          onClose();
        }
      }
    : undefined;

  const { title, disabled, actionTitle, deleteTitle, children } = props;
  return (
    <div className="fixed-full-page modal">
      <div className="modal-dialog">
        <div className="modal-content" data-toggle={MODAL_DATA_VALUE}>
          <div className="modal-header">
            <button type="button" className="modal-close" onClick={onClose}>
              <span>&times;</span>
            </button>
            <h4 className="modal-title">{title}</h4>
          </div>
          <div className="modal-body">{children}</div>
          <ModalFooter
            disabled={disabled}
            actionTitle={actionTitle}
            onAction={onAction}
            deleteTitle={deleteTitle}
            onDelete={onDelete}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
});

interface ModalFooterProps {
  disabled?: boolean;
  actionTitle?: string;
  onAction?: () => Promise<void>;
  deleteTitle?: string;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

const ModalFooter = memo(function ModalFooter(
  props: ModalFooterProps,
): JSX.Element {
  const { deleteTitle, onDelete, actionTitle, onAction, onClose, disabled } =
    props;
  return (
    <div className="modal-footer">
      <button
        type="button"
        disabled={disabled}
        className="btn btn-dropdown pull-right"
        onClick={onClose}
      >
        Close
      </button>

      {deleteTitle && onDelete && (
        <button
          type="button"
          disabled={disabled}
          className="btn btn-delete"
          style={{ float: actionTitle && onAction ? "left" : "right" }}
          onClick={() => void onDelete()}
        >
          {deleteTitle}
        </button>
      )}

      {actionTitle && onAction && (
        <button
          type="button"
          disabled={disabled}
          className="btn btn-primary pull-right"
          onClick={() => void onAction()}
        >
          {actionTitle}
        </button>
      )}
      <div className="clearfix" />
    </div>
  );
});

interface ModalInputProps extends ModalProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const ModalInput = memo(function ModalInput(
  props: ModalInputProps,
): JSX.Element {
  const { label, value, placeholder, onChange, ...rest } = props;
  return (
    <Modal {...rest}>
      <div className="modal-input-container">
        <label className="modal-input-label">{label}</label>
        <div className="modal-input">
          <input
            className="form-input"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
          />
        </div>
        <div className="clearfix" />
      </div>
    </Modal>
  );
});

export { Modal, ModalInput };
export type { ModalHandler };
