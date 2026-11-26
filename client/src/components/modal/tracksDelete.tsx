import type { JSX } from "react";
import { memo, useState } from "react";

import { LIBRARY_NAME } from "src/constants";
import { useActions, useSelectorState } from "src/providers/hooks";
import { getFilteredSelection } from "src/selectors";
import type { Selection } from "src/types/playlistTypes";
import type { Library } from "src/types/trackTypes";
import { normalizeTrack } from "src/utils";

import { libraryColumns } from "../table/columns";
import type { Column } from "../table/tableTypes";
import { Modal } from "./util";

const TracksDelete = memo(function TracksDelete(): JSX.Element {
  const actions = useActions();
  const selectorState = useSelectorState();
  const stateProps = selectStateProps(selectorState);
  const [deleting, setDeleting] = useState(false);

  async function onDelete(): Promise<boolean> {
    setDeleting(true);
    const { deleteErrs, serverErrs } = await actions.tracksDelete();
    setDeleting(false);
    return deleteErrs.length === 0 && serverErrs.length === 0;
  }

  function renderDeleteItems(): JSX.Element {
    const { columns, isPlaying, library, index, selection } = stateProps;
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
              {itemPlayIndexes.map((itemIndex) => {
                const trackId = selection.get(itemIndex);
                const track =
                  trackId === undefined ? undefined : library[trackId];
                if (!track) {
                  return null;
                }
                const sample = normalizeTrack(track, itemIndex);
                return (
                  <tr key={itemIndex}>
                    {columns.map((column) => (
                      <column.Component
                        key={column.title}
                        isPlaying={isPlaying}
                        index={index}
                        sample={sample}
                        editable={false}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const { selection } = stateProps;
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

interface TracksDeleteStateProps {
  columns: Column[];
  library: Library;
  selection: Selection;
  isPlaying: boolean;
  index: number | null;
}

function selectStateProps(
  state: ReturnType<typeof useSelectorState>,
): TracksDeleteStateProps {
  const { account, tracks } = state;
  const { libraries, playlists, playing } = tracks;
  const library = libraries[LIBRARY_NAME] ?? {};
  const index = playlists?.[LIBRARY_NAME]?.index ?? null;
  const { isPlaying } = playing;
  const columns = libraryColumns.filter((c) => account.columns?.has(c.title));
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
