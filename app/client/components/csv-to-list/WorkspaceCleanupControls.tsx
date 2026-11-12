import { useState } from "react";
import { WORKSPACE_HEADER_LENGTH, WORKSPACE_ROW_RANGE_LENGTH, type WorkspaceCleanupOptions } from "./tableWorkspaceCleanup";
import { workspaceColumnLabel, type WorkspaceTable } from "./tableWorkspaceData";

const field = "min-h-11 max-w-full rounded-lg border border-slate-300 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-sky-600";
const choice = "flex min-h-11 items-center gap-2 text-sm";

type Props = {
  table: WorkspaceTable;
  selected: number[];
  onChange: () => void;
  onPreview: (options: WorkspaceCleanupOptions) => void;
};

export function WorkspaceCleanupControls({ table, selected, onChange, onPreview }: Props) {
  const [excludedRows, setExcludedRows] = useState("");
  const [trimCells, setTrimCells] = useState(false);
  const [blankColumn, setBlankColumn] = useState("off");
  const [duplicateKeys, setDuplicateKeys] = useState<number[] | null>(null);
  const [sortColumn, setSortColumn] = useState("");
  const [descending, setDescending] = useState(false);
  const [renameColumn, setRenameColumn] = useState("");
  const [newName, setNewName] = useState("");
  const positions = Array.from({ length: table.columnCount }, (_, index) => index);
  const columns = positions.map((position) => (
    <option value={position} key={position}>{workspaceColumnLabel(table, position)}</option>
  ));
  const canPreview = Boolean(excludedRows.trim() || trimCells || blankColumn !== "off" || duplicateKeys || sortColumn || renameColumn);

  function update<T>(setter: (value: T) => void, value: T) {
    setter(value);
    onChange();
  }

  function preview() {
    let blankColumns: number[] | null = null;
    if (blankColumn === "all") blankColumns = positions;
    else if (blankColumn === "selected") blankColumns = selected;
    else if (blankColumn !== "off") blankColumns = [Number(blankColumn)];
    onPreview({
      excludedRows,
      trimCells,
      blankColumns,
      duplicateKeys,
      sort: sortColumn === "" ? null : { column: Number(sortColumn), descending },
      rename: renameColumn === "" ? null : { column: Number(renameColumn), name: newName },
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">Preview the cleanup before applying it to the export. Steps run in the order shown. Your pasted or opened source stays available.</p>
      <label className="block space-y-1 text-sm">
        <span className="block font-semibold">Exclude data rows</span>
        <input className={field + " block w-full"} value={excludedRows} maxLength={WORKSPACE_ROW_RANGE_LENGTH}
          aria-describedby="cleanup-row-numbers" placeholder="2, 5-7" onChange={(event) => update(setExcludedRows, event.target.value)} />
      </label>
      <p className="text-sm text-slate-600" id="cleanup-row-numbers">Use row numbers from the table before previewing cleanup. The first data row is 1 and the header is separate.</p>
      <label className={choice}>
        <input type="checkbox" checked={trimCells} onChange={(event) => update(setTrimCells, event.target.checked)} />
        Trim leading and trailing whitespace in data cells
      </label>
      <label className="block space-y-1 text-sm">
        <span className="block font-semibold">Remove rows blank in</span>
        <select className={field} value={blankColumn} onChange={(event) => update(setBlankColumn, event.target.value)}>
          <option value="off">Keep blank rows</option>
          <option value="all">All data columns</option>
          <option value="selected">Selected output columns</option>
          {columns}
        </select>
      </label>
      {blankColumn !== "off" && <p className="text-sm text-slate-600">Missing, empty, and whitespace-only cells count as blank. Every chosen cell must be blank to remove a row.</p>}
      <label className={choice}>
        <input type="checkbox" checked={duplicateKeys !== null} onChange={(event) => {
          update(setDuplicateKeys, event.target.checked ? (selected.length ? selected : positions) : null);
        }} /> Remove duplicate rows
      </label>
      {duplicateKeys !== null && (
        <fieldset className="min-w-0 rounded-lg border border-slate-300 p-2">
          <legend className="px-1 text-sm font-semibold">Match on these columns</legend>
          <p className="text-sm text-slate-600">Keep the first row for each exact, case-sensitive match. Missing cells and explicit empty cells match separately.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={field} onClick={() => update(setDuplicateKeys, positions)}>Match all columns</button>
            <button type="button" className={field} onClick={() => update(setDuplicateKeys, [])}>Clear matching columns</button>
          </div>
          <div className="max-h-52 overflow-auto">
            {positions.map((column) => (
              <label key={column} className={choice}>
                <input type="checkbox" checked={duplicateKeys.includes(column)} onChange={(event) => {
                  const next = event.target.checked ? [...duplicateKeys, column] : duplicateKeys.filter((key) => key !== column);
                  update(setDuplicateKeys, next);
                }} />
                <span className="[overflow-wrap:anywhere]">{workspaceColumnLabel(table, column)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 space-y-1 text-sm">
          <span className="block font-semibold">Sort by column</span>
          <select className={field} value={sortColumn} onChange={(event) => update(setSortColumn, event.target.value)}>
            <option value="">Keep row order</option>
            {columns}
          </select>
        </label>
        {sortColumn !== "" && (
          <label className="space-y-1 text-sm">
            <span className="block font-semibold">Text sort order</span>
            <select className={field} value={descending ? "descending" : "ascending"} onChange={(event) => {
              update(setDescending, event.target.value === "descending");
            }}>
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
          </label>
        )}
      </div>
      {sortColumn !== "" && <p className="text-sm text-slate-600">Sort compares text as written, so 10 comes before 2 when ascending. Blanks stay last and ties keep their order.</p>}
      {table.headers && (
        <>
          <label className="block space-y-1 text-sm">
            <span className="block font-semibold">Rename header</span>
            <select className={field} value={renameColumn} onChange={(event) => {
              const column = event.target.value;
              setNewName(column === "" ? "" : table.headers?.[Number(column)] ?? "");
              update(setRenameColumn, column);
            }}>
              <option value="">Keep existing headers</option>
              {columns}
            </select>
          </label>
          {renameColumn !== "" && (
            <label className="block space-y-1 text-sm">
              <span className="block font-semibold">New header name</span>
              <input className={field + " block w-full"} value={newName} maxLength={WORKSPACE_HEADER_LENGTH}
                onChange={(event) => update(setNewName, event.target.value)} />
            </label>
          )}
        </>
      )}
      <button className={field + " font-semibold hover:bg-sky-50 disabled:opacity-50"} type="button" onClick={preview} disabled={!canPreview}>Preview cleanup</button>
    </div>
  );
}
