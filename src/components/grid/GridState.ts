import {
  AnyGridColumn,
  Column,
  RenderableType,
} from "@/components/grid/columns/Column";
import { FilterOperator, FilterOption } from "@/components/grid/filters/types";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { hasAllProperties } from "@/components/util/helpers";
import { firstBy } from "thenby";
import Vue from "vue";

const gridIndexId = "_grid-index";
export type AnyWithGridIndex = { [gridIndexId]: number };

type SortOrder = "asc" | "desc" | -1 | 1;
interface ThenByOpts {
  direction?: SortOrder;
  ignoreCase?: boolean;
}

interface SortOptions {
  key: string;
  options: ThenByOpts;
}

type SortFunction = IThenBy<{
  [x: string]: Record<string, unknown>;
}>;

interface PinnedColumnGroups {
  left: Column<any, RenderableType>[];
  center: Column<any, RenderableType>[];
  right: Column<any, RenderableType>[];
}

interface ColumnState {
  width: number;
  pinnedColumn: string | undefined;
  filterOptions: FilterOption<RenderableType>[];
  filterChain: (itemValue: RenderableType) => boolean;
}

export class GridState {
  public searchValue: string = "";
  #sortOptions: SortOptions[] = [];
  #sortFunction: SortFunction = firstBy("_grid-index");
  #columnStates: Map<string, ColumnState> = new Map<string, ColumnState>();

  constructor(gridConfiguration?: GridConfiguration<any>) {
    // If we are provided a grid configuration, we should apply the defaults given by it
    if (gridConfiguration) {
      gridConfiguration.columns.forEach((column) => {
        const columnState: ColumnState = {
          width: column.options.defaultWidth!,
          pinnedColumn: column.options.defaultPin,
          filterOptions: [],
          filterChain: (itemValue: RenderableType) => true,
        };

        this.#columnStates.set(column.key, columnState);
      });
    }
  }

  get totalWidth() {
    return Array.from(this.#columnStates).reduce(
      (acc, [key, column]) => acc + column.width,
      0
    );
  }

  getColumnState(key: string): ColumnState {
    return this.#columnStates.get(key)!;
  }

  // Build the function only when we update sorting options
  #buildSortFunction() {
    if (this.#sortOptions.length) {
      // If we have anything to sort by
      let sortBy = firstBy(
        this.#sortOptions[0].key,
        this.#sortOptions[0].options
      );

      this.#sortOptions.forEach((opt) => {
        sortBy = sortBy.thenBy(opt.key, opt.options);
      });

      this.#sortFunction = sortBy.thenBy("_grid-index");
      return;
    }

    // Otherwise, default to original order
    this.#sortFunction = firstBy("_grid-index");
  }

  /**
   * Cycles through sorting behaviours for a column
   *
   * @param key The column key to toggle sorting behaviours for
   */
  public toggleSort(key: string) {
    const existingOptionIndex = this.#sortOptions.findIndex(
      (option) => option.key === key
    );

    // Creates a new sorting option if we don't have one
    if (existingOptionIndex === -1) {
      this.#sortOptions.push({
        key,
        options: { direction: "asc" },
      });
      this.#buildSortFunction();
      return;
    }

    // Otherwise, progresses or removes
    const existingOption = this.#sortOptions[existingOptionIndex];
    if (existingOption.options.direction === "asc") {
      existingOption.options.direction = "desc";
    } else {
      this.#sortOptions.splice(existingOptionIndex, 1);
    }

    this.#buildSortFunction();
  }

  /**
   *
   * @param key The column key to look for
   * @returns The sorting options and current index for a given column
   */
  public isSortingOnKey(key: string) {
    const index = this.#sortOptions.findIndex((option) => option.key === key);
    return index !== -1
      ? { ...this.#sortOptions[index], index: index + 1 }
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
    items: any[],
    gridConfiguration: GridConfiguration<any>
  ): AnyWithGridIndex[] {
    const filtersExist = Object.entries(this.#columnStates).some(
      ([key, column]) => column.filterOptions.length
    );

    if (this.searchValue === "" && !filtersExist) {
      return items.sort(this.#sortFunction);
    }

    return items
      .filter((item) => {
        // !searchValue allows for being true if we don't have a search value to check against
        let searchPassed = !this.searchValue;

        for (const column of gridConfiguration.columns) {
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

          const filterChain = this.#columnStates[column.key].filterChain;

          if (typeof filterChain !== "undefined") {
            if (!filterChain(itemValueForColumn)) {
              return false;
            }
          }
        }

        return searchPassed;
      })
      .sort(this.#sortFunction);
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
    if (!this.#columnStates[column.key].filterOptions) {
      Vue.set(this.#columnStates[column.key].filterOptions, column.key, []);
    }

    this.#columnStates[column.key].filterOptions[column.key].push({
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
    Vue.set(this.#columnStates[columnKey], "filterChain", filterChain);
  }

  /**
   * Removes a filter against a column, with a given index
   * @param column The column the filter should be removed for
   * @param index The index of the filter
   */
  public removeFilter(column: AnyGridColumn, index: number) {
    this.#columnStates[column.key].filterOptions.splice(index, 1);

    const filterChain = this.#buildFilterFunctionsForColumn(column.key);
    Vue.set(this.#columnStates[column.key], "filterChain", filterChain);
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
    const options = this.#columnStates[key].filterOptions;

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

  public columnGroups(
    gridConfiguration: GridConfiguration<any>
  ): PinnedColumnGroups {
    const leftColumns = gridConfiguration.columns.filter(
      (column) => this.#columnStates[column.key].pinnedColumn === "left"
    );

    const rightColumns = gridConfiguration.columns.filter(
      (column) => this.#columnStates[column.key].pinnedColumn === "right"
    );

    const centerColumns = gridConfiguration.columns.filter(
      (column) =>
        !leftColumns.find((pinnedColumn) => column.key === pinnedColumn.key) &&
        !rightColumns.find((pinnedColumn) => column.key === pinnedColumn.key)
    );

    return {
      left: leftColumns,
      center: centerColumns,
      right: rightColumns,
    };
  }
}
