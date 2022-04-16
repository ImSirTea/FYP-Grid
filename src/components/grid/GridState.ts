import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import {
  AnyGridColumn,
  ColumnOptions,
} from "@/components/grid/columns/AbstractColumn";
import { FilterOperator, FilterOption } from "@/components/grid/filters/types";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { hasAllProperties } from "@/components/util/helpers";
import { firstBy } from "thenby";
import Vue from "vue";
import { cloneDeep } from "lodash";

export const rowIndex = "rowIndex" as const;
export type AnyWithRowIndex = { [rowIndex]: number };

interface GridCellsWithErrors {
  [rowIndex: number]: {
    [columnKey: string]: boolean;
  };
}

interface SortOptions {
  column: AnyGridColumn;
  direction: "asc" | "desc";
}

interface ColumnState {
  width: ColumnOptions["defaultWidth"];
  pin: ColumnOptions["defaultPin"];
  isHidden: ColumnOptions["defaultHidden"];
  order: number;
  filterOptions: FilterOption<any>[];
  filterChain?: (itemValue: any) => boolean;
}

export class GridState {
  public searchValue: string = "";
  public sortOptions: SortOptions[] = [];
  private sortFunction = firstBy(rowIndex);
  columnStates: Record<string, ColumnState> = {};
  // Can't rely on :hover as our rows aren't all in the same row due to pins
  rowHovered: AnyWithRowIndex[typeof rowIndex] | null = null;

  // Which column are we dragging, highlight it so dragging is clearer
  columnDragged: AnyGridColumn | null = null;

  // The cell currently being edited
  cellEdited: {
    rowId: AnyWithRowIndex[typeof rowIndex];
    columnKey: AnyGridColumn["key"];
  } | null = null;

  // Have changes been made to the data
  isDirty: boolean = false;

  selectAllRows: boolean = false;
  selectedRowIds: AnyWithRowIndex[typeof rowIndex][] = [];

  rowCellsWithErrors: GridCellsWithErrors = {};

  get totalWidth() {
    return Object.entries(this.columnStates).reduce(
      (acc, [key, column]) => acc + column.width,
      0
    );
  }

  // Build the function only when we update sorting options
  #buildSortFunction() {
    if (this.sortOptions.length) {
      let sortBy;

      this.sortOptions.forEach((opt) => {
        if (!sortBy) {
          sortBy = firstBy((item: AnyWithRowIndex) => {
            return opt.column.value(item);
          }, opt.direction);
        } else {
          sortBy = sortBy.thenBy((item: AnyWithRowIndex) => {
            return opt.column.value(item);
          }, opt.direction);
        }
      });

      this.sortFunction = sortBy.thenBy(rowIndex);
      return;
    }

    // Otherwise, default to original order
    this.sortFunction = firstBy(rowIndex);
  }

  /**
   * Cycles through sorting behaviours for a column
   *
   * @param column The column to toggle sorting behaviours for
   */
  public toggleSort(column: AnyGridColumn) {
    const existingOptionIndex = this.sortOptions.findIndex(
      (option) => option.column.key === column.key
    );

    // Creates a new sorting option if we don't have one
    if (existingOptionIndex === -1) {
      this.sortOptions.push({
        column,
        direction: "asc",
      });
      this.#buildSortFunction();
      return;
    }

    // Otherwise, progresses or removes
    const existingOption = this.sortOptions[existingOptionIndex];
    if (existingOption.direction === "asc") {
      existingOption.direction = "desc";
    } else {
      this.sortOptions.splice(existingOptionIndex, 1);
    }

    this.#buildSortFunction();
  }

  /**
   *
   * @param column The column to look for
   * @returns The sorting options and current index for a given column
   */
  public isSortingOnKey(column: AnyGridColumn) {
    const index = this.sortOptions.findIndex(
      (option) => option.column.key === column.key
    );
    return index !== -1
      ? { ...this.sortOptions[index], index: index + 1 }
      : null;
  }

  /**
   * Provides a way of setting our search value, without interferring with props
   *
   * @param newValue The new search for value to filter by
   */
  public setSearchValue(newValue: string) {
    this.searchValue = newValue;
  }

  /**
   * @param items The items to filter and sort by
   * @param gridConfiguration The grid configuration, used to get item values
   * @returns Items with filtering and sorting
   */
  public filterAndSortItems(
    items: AnyWithRowIndex[],
    gridConfiguration: GridConfiguration<AnyWithRowIndex>
  ): AnyWithRowIndex[] {
    const filtersExist = Object.entries(this.columnStates).some(
      ([key, column]) => column.filterOptions.length
    );

    if (this.searchValue === "" && !filtersExist) {
      return items.sort(this.sortFunction);
    }

    // If our filters aren't valid, then return the items as they are
    if (!this.filtersAreValid) {
      return items;
    }

    return items
      .filter((item) => {
        // !searchValue allows for being true if we don't have a search value to check against
        let searchPassed = !this.searchValue;

        const columnsToFilter = gridConfiguration.columns.filter(
          (column) => column.options.isFilterable
        );

        for (const column of columnsToFilter) {
          const itemValueForColumn = column.value(item);
          const itemValueAsString = column
            .value(item)
            .toString()
            .toLowerCase()
            .trim();

          const searchByValue = this.searchValue.toLowerCase().trim();

          // If our item value matches our search term, just return true
          if (this.searchValue && itemValueAsString.includes(searchByValue)) {
            searchPassed = true;
          }

          const filterChain = this.columnStates[column.key].filterChain;

          if (typeof filterChain !== "undefined") {
            if (!filterChain(itemValueForColumn)) {
              return false;
            }
          }
        }

        return searchPassed;
      })
      .sort(this.sortFunction);
  }

  /**
   * @param items The list of items to inject grid indexes into
   * @returns A list of items, with grid indexes injected
   */
  public injectGridIndexes(items: Record<string, any>[]): AnyWithRowIndex[] {
    // This also doubles as creating a deep clone, as to not mess with the original items

    return items.map((item, index) => {
      const newItem = cloneDeep(item);
      newItem[rowIndex] = index;

      return newItem as AnyWithRowIndex;
    });
  }

  /**
   * @param items The list of items to remove grid indexes from
   * @returns A list of items, with grid indexes removed
   */
  public removeGridIndexes(items: AnyWithRowIndex[]) {
    return items.map((item) => {
      const itemClone = Object.assign({}, item);
      delete (itemClone as any)[rowIndex];
      return itemClone;
    });
  }

  /**
   * Create a new filter for a given column
   * @param column Column to insert a new filter for
   */
  public addNewFilter(column: AnyGridColumn) {
    const columnState = this.columnStates[column.key];

    if (!columnState.filterOptions) {
      Vue.set(columnState.filterOptions, column.key, []);
    }

    columnState.filterOptions.push({
      filterFunction: undefined,
      value: undefined,
      operator: FilterOperator.and,
    });
  }

  /**
   * Removes a filter against a column, with a given index
   * @param column The column the filter should be removed for
   * @param index The index of the filter
   */
  public removeFilter(column: AnyGridColumn, index: number) {
    this.columnStates[column.key].filterOptions.splice(index, 1);

    const filterChain = this.buildFilterFunctionsForColumn(column.key);
    Vue.set(this.columnStates[column.key], "filterChain", filterChain);
  }

  /**
   * Checks if a filter option is valid by ensuring all properties are defined,
   * except for the final filter option, where operator isn't required
   * @param options
   * @param totalNumberOfOptions
   * @param index
   * @returns
   */
  #isValidFilterOption(
    options: FilterOption<any>,
    totalNumberOfOptions: number,
    index: number
  ) {
    if (totalNumberOfOptions === index + 1) {
      return (
        options.filterFunction !== undefined && options.value !== undefined
      );
    }

    return hasAllProperties(options);
  }

  /**
   * Build filter chains as and when a column's filters are changed, rather than rebuild on use. Should help with performance
   * @param key The column's key to build the chain for
   * @returns All column's filter options, chained together
   */
  buildFilterFunctionsForColumn(key: string) {
    const options = this.columnStates[key].filterOptions;

    if (typeof options === "undefined") {
      return null;
    }

    const filterChain = options?.reduceRight(
      (chain, option, index) => {
        if (this.#isValidFilterOption(option, options.length, index)) {
          if (option.operator === FilterOperator.or) {
            return (itemValue: any) =>
              chain(itemValue) ||
              option.filterFunction!(itemValue, option.value);
          }
          return (itemValue: any) =>
            chain(itemValue) && option.filterFunction!(itemValue, option.value);
        }
        return chain;
      },
      (itemValue: any) => true
    );

    this.columnStates[key].filterChain = filterChain;
  }

  /**
   * @param draggedColumn The column we want to move
   * @param targetColumn Where we want to move the column to
   */
  public rearrangeColumnOrders(
    draggedColumn: AnyGridColumn,
    targetColumn: AnyGridColumn
  ) {
    if (targetColumn instanceof ActionColumn) {
      return;
    }

    const draggedColumnState = this.columnStates[draggedColumn.key];
    const initialOrder = draggedColumnState.order;

    const targetColumnState = this.columnStates[targetColumn.key];
    const targetOrder = targetColumnState.order;

    const orderedColumns = Object.values(this.columnStates).sort(
      (stateA, stateB) => stateA.order - stateB.order
    );

    // Going up (right on screen)
    if (targetOrder > initialOrder) {
      for (let i = targetOrder; i > initialOrder; i--) {
        orderedColumns[i].order--;
      }

      draggedColumnState.order = targetOrder;
    }

    // Going down (left on screen)
    if (initialOrder > targetOrder) {
      for (let i = targetOrder; i <= initialOrder; i++) {
        orderedColumns[i].order++;
      }

      draggedColumnState.order = targetOrder;
    }
  }

  /**
   * Are all of our filters valid, used to prevent re-filtering with invalid filters wastefully
   */
  get filtersAreValid() {
    const columnStatesValues = Array.from(Object.values(this.columnStates));

    for (const { filterOptions } of columnStatesValues) {
      for (const [index, option] of filterOptions.entries()) {
        if (!this.#isValidFilterOption(option, filterOptions.length, index)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Adds a cell to our object of known validation errors
   * @param index The row index of the erroring cell
   * @param key The column key of the erroring cell
   */
  addCellError(index: number, key: string) {
    const existingErrorForRow = this.rowCellsWithErrors[index];

    if (!existingErrorForRow) {
      this.rowCellsWithErrors[index] = {};
    }

    this.rowCellsWithErrors[index][key] = true;
  }

  /**
   * Removes a cell from our object of known validation errors
   * @param index The row index of the erroring cell
   * @param key The column key of the erroring cell
   */
  removeCellError(index: number, key: string) {
    const existingErrorForRow = this.rowCellsWithErrors[index];

    if (existingErrorForRow) {
      delete this.rowCellsWithErrors[index][key];

      if (Object.entries(this.rowCellsWithErrors[index]).length === 0) {
        delete this.rowCellsWithErrors[index];
      }
    }
  }
}
