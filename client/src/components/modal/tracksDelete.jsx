import { memo, useState } from "react";

import { LIBRARY_NAME } from "src/constants";
import { useActions, useWavesSelector } from "src/providers/hooks";
import { getFilteredSelection } from "src/selectors";
import { normalizeTrack } from "src/utils";

import { libraryColumns } from "../table/columns";
import { Modal } from "./util";

const TracksDelete = memo(function TracksDelete(ownProps) {
  const actions = useActions();
  const props = useWavesSelector((state) => selectStateProps(state, ownProps));
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    const { deleteErrs, serverErrs } = await actions.tracksDelete();
    setDeleting(false);
    return deleteErrs.length === 0 && serverErrs.length === 0;
  }

  function renderDeleteItems() {
    const { columns, isPlaying, library, index, selection } = props;
    const itemPlayIndexes = Array.from(selection.keys());
    itemPlayIndexes.sort((a, b) => a - b);
    return (
      <div>
        <div>
          <table className="table modal-table">
            <thead>
              <tr>
                {columns.map(({ title }) => (
                  <th key={title}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemPlayIndexes.map((itemIndex) => (
                <tr key={itemIndex}>
                  {columns.map((column) => (
                    <column.Component
                      key={column.title}
                      isPlaying={isPlaying}
                      index={index}
                      sample={normalizeTrack(
                        library[selection.get(itemIndex)],
                        itemIndex,
                      )}
                      editable={false}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const { selection } = props;
  const deleteTitle = deleting ? "Deleting" : "Delete";
  const plurality = selection.size > 1 ? "s" : "";
  const title = `Delete track${plurality}`;
  const message = `This will delete the track${plurality} below. Are you sure?`;
  return (
    <Modal
      actions={actions}
      deleteTitle={deleteTitle}
      disabled={deleting}
      title={title}
      onDelete={onDelete}
    >
      <div>
        <span>{message}</span>
      </div>
      {renderDeleteItems()}
    </Modal>
  );
});

function selectStateProps(state) {
  const { account, tracks } = state;
  const { libraries, playlists, playing } = tracks;
  const library = libraries[LIBRARY_NAME];
  const playlist = playlists[LIBRARY_NAME];
  const { index } = playlist;
  const { isPlaying } = playing;
  const columns = libraryColumns.filter((c) => account.columns.has(c.title));
  const selection = getFilteredSelection(state, LIBRARY_NAME);
  return {
    columns,
    library,
    selection,
    isPlaying,
    index,
  };
}

export { TracksDelete };
