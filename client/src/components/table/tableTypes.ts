import type { ComponentType } from "react";

import type { NormalizedTrack } from "src/types/trackTypes";

/* Track attributes that can be edited in the table */
type EditableAttribute = "title" | "artist" | "album" | "genre";

type OnItemEdit = (id: string, attr: EditableAttribute, update: string) => void;

/* Props of a table cell. Tables in modals are read only, so they do not
 * pass the editing props */
interface CellProps {
  sample: NormalizedTrack;
  /* Index of the playing track */
  index: number | null;
  isPlaying: boolean;
  editable: boolean;
  title?: string;
  onChange?: OnItemEdit;
  onBlur?: () => void;
}

interface Column {
  title: string;
  /* Track attribute to sort by */
  attribute?: string;
  sortable?: boolean;
  Component: ComponentType<CellProps>;
}

export type { CellProps, Column, EditableAttribute, OnItemEdit };
