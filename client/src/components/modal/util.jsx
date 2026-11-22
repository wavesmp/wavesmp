import { memo } from "react";

import { MODAL_DATA_VALUE } from "src/constants";

const Modal = memo(function Modal(props) {
  const onClose = () => {
    const { actions } = props;
    actions.modalSet(null);
  };

  const onAction = async () => {
    const { onAction } = props;
    if (await onAction()) {
      onClose();
    }
  };

  const onDelete = async () => {
    const { onDelete } = props;
    if (await onDelete()) {
      onClose();
    }
  };

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

const ModalFooter = memo(function ModalFooter(props) {
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
          onClick={onDelete}
        >
          {deleteTitle}
        </button>
      )}

      {actionTitle && onAction && (
        <button
          type="button"
          disabled={disabled}
          className="btn btn-primary pull-right"
          onClick={onAction}
        >
          {actionTitle}
        </button>
      )}
      <div className="clearfix" />
    </div>
  );
});

const ModalInput = memo(function ModalInput(props) {
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
