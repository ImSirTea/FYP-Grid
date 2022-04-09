import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import {
  AnyGridColumn,
  ColumnOptions,
  RenderableType,
} from "@/components/grid/columns/Column";
import { FilterOperator, FilterOption } from "@/components/grid/filters/types";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { hasAllProperties } from "@/components/util/helpers";
import { firstBy, IThenBy } from "thenby";
import Vue from "vue";

const gridIndexId = "_grid-index" as const;
export type AnyWithGridIndex = { [gridIndexId]: number };

interface SortOptions {
  column: AnyGridColumn;
  direction: "asc" | "desc";
}

interface ColumnState {
  width: ColumnOptions["defaultWidth"];
  pin: ColumnOptions["defaultPin"];
  isHidden: ColumnOptions["defaultHidden"];
  order: number;
  filterOptions: FilterOption<RenderableType>[];
  filterChain: (itemValue: RenderableType) => boolean;
}

export class GridState {
  public searchValue: string = "";
  public sortOptions: SortOptions[] = [];
  private sortFunction: IThenBy<AnyWithGridIndex> = firstBy("_grid-index");
  columnStates: Record<string, ColumnState> = {};
  // Can't rely on :hover as our rows aren't all in the same row due to pins
  rowHovered: AnyWithGridIndex[typeof gridIndexId] | null = null;

  // Which column are we dragging, highlight it so dragging is clearer
  columnDragged: AnyGridColumn | null = null;

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
          sortBy = firstBy((item: AnyWithGridIndex) => {
            return opt.column.value(item);
          }, opt.direction);
        } else {
          sortBy = sortBy.thenBy((item: AnyWithGridIndex) => {
            return opt.column.value(item);
          }, opt.direction);
        }
      });

      this.sortFunction = sortBy.thenBy("_grid-index");
      return;
    }

    // Otherwise, default to original order
    this.sortFunction = firstBy("_grid-index");
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
    items: AnyWithGridIndex[],
    gridConfiguration: GridConfiguration<AnyWithGridIndex>
  ): AnyWithGridIndex[] {
    const filtersExist = Object.entries(this.columnStates).some(
      ([key, column]) => column.filterOptions.length
    );

    if (this.searchValue === "" && !filtersExist) {
      return items.sort(this.sortFunction);
    }

    return items
      .filter((item) => {
        // !searchValue allows for being true if we don't have a search value to check against
        let searchPassed = !this.searchValue;

        const columnsToFilter = gridConfiguration.columns.filter(
          (column) => column.options.isFilterable
        );

        for (const column of columnsToFilter) {
          const itemValueForColumn = column
            .value(item)
            .toString()
            .toLowerCase()
            .trim();

          const searchByValue = this.searchValue.toLowerCase().trim();

          // If our item value matches our search term, just return true
          if (this.searchValue && itemValueForColumn.includes(searchByValue)) {
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
   * TODO: This is probably wasteful
   * @param items The list of items to inject grid indexes into
   * @returns A list of items, with grid indexes injected
   */
  public injectGridIndexes(items: Record<string, any>[]) {
    return items.map((item, index) => ({
      [gridIndexId]: index,
      ...item,
    }));
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
      operator: undefined,
    });
  }

  /**
   * Updates a filter with given values, for a specified column
   * @param filter The filter to be updated
   * @param propertyName The filter property to update
   * @param value The value for the filter property to become
   * @param columnKey The column's key which the filter belongs to
   */
  public setFilterProperty(
    filter: FilterOption<RenderableType>,
    propertyName: keyof FilterOption<RenderableType>,
    value: any,
    columnKey: string
  ) {
    Vue.set(filter, propertyName, value);

    const filterChain = this.#buildFilterFunctionsForColumn(columnKey);
    Vue.set(this.columnStates[columnKey], "filterChain", filterChain);
  }

  /**
   * Removes a filter against a column, with a given index
   * @param column The column the filter should be removed for
   * @param index The index of the filter
   */
  public removeFilter(column: AnyGridColumn, index: number) {
    this.columnStates[column.key].filterOptions.splice(index, 1);

    const filterChain = this.#buildFilterFunctionsForColumn(column.key);
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
    options: FilterOption<RenderableType>,
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
  #buildFilterFunctionsForColumn(key: string) {
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

    return filterChain;
  }

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

    // Going up
    if (targetOrder > initialOrder) {
      for (let i = targetOrder; i > initialOrder; i--) {
        orderedColumns[i].order--;
      }

      draggedColumnState.order = targetOrder;
    }

    // Going down
    if (initialOrder > targetOrder) {
      for (let i = targetOrder; i <= initialOrder; i++) {
        orderedColumns[i].order++;
      }

      draggedColumnState.order = targetOrder;
    }
  }
}
