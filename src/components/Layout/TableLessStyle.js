import React from "react";
import {
  useTable,
  useGlobalFilter,
  useAsyncDebounce,
  useFilters,
  useSortBy,
  usePagination,
} from "react-table";
import { twMerge } from "tailwind-merge";

function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Render the UI for your table
  const cellHeaderStyle = twMerge(
    // "border",
    // "border-black",
    "bg-blue-100",
    "p-1"
  );
  const cellStyle = twMerge("p-1", "border dark:border-gray-300", "pr-[23px]");
  const tableStyle = twMerge(
    "divide-y",
    "divide-gray-200",
    "dark:divide-gray-700"
  );

  return (
    <div className="ml-2">
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      {headerGroups.map((headerGroup) =>
        headerGroup.headers.map((column) =>
          column.Filter ? (
            <div key={column.id}>
              <label htmlFor={column.id}>{column.render("Header")}: </label>
              {column.render("Filter")}
            </div>
          ) : null
        )
      )}
      <div className="flex grow w-100 mt-2">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 inline-block align-middle">
            <div className="border rounded-xl dark:border-gray-300">
              <table className={tableStyle} {...getTableProps()}>
                <thead className={cellHeaderStyle}>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          className={cellStyle}
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                        >
                          {column.render("Header")}

                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " ▼"
                                : " ▲"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr className={cellStyle} {...row.getRowProps()}>
                        {row.cells.map((cell) => {
                          return (
                            <td className={cellStyle} {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                  {"<<"}
                </button>{" "}
                <button
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                >
                  {"<"}
                </button>{" "}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                  {">"}
                </button>{" "}
                <button
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                >
                  {">>"}
                </button>{" "}
                <span>
                  Page{" "}
                  <strong>
                    {state.pageIndex + 1} of {pageOptions.length}
                  </strong>{" "}
                </span>
                <select
                  value={state.pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {[5, 10, 20].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <pre>
          <code>{JSON.stringify(state, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      Search:{" "}
      <input
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      name={id}
      id={id}
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default Table;
