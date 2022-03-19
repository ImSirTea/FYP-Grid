import { Column, RenderableType } from "@/components/grid/columns/Column";
import NumberFilterOptions from "@/components/grid/filters/NumberFilterOptions";
import {
  FilterFunction,
  FilterOperator,
  FilterOption,
} from "@/components/grid/filters/types";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { hasAllProperties } from "@/components/util/helpers";
import { isArguments } from "lodash";
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

export class GridState {
  sortOptions: SortOptions[] = [];
  searchValue: string = "";
  filterOptions: Record<string, FilterOption<RenderableType>[]> = {};
  filterChains: Record<string, (itemValue: RenderableType) => boolean> = {};
  sortFunction: SortFunction = firstBy("_grid-index");

  // Build the function only when we update sorting options
  buildSortFunction() {
    if (this.sortOptions.length) {
      // If we have anything to sort by
      let sortBy = firstBy(
        this.sortOptions[0].key,
        this.sortOptions[0].options
      );

      this.sortOptions.forEach((opt) => {
        sortBy = sortBy.thenBy(opt.key, opt.options);
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
   * @param key The column key to toggle sorting behaviours for
   */
  toggleSort(key: string) {
    const existingOptionIndex = this.sortOptions.findIndex(
      (option) => option.key === key
    );

    // Creates a new sorting option if we don't have one
    if (existingOptionIndex === -1) {
      this.sortOptions.push({
        key,
        options: { direction: "asc" },
      });
      this.buildSortFunction();
      return;
    }

    // Otherwise, progresses or removes
    const existingOption = this.sortOptions[existingOptionIndex];
    if (existingOption.options.direction === "asc") {
      existingOption.options.direction = "desc";
    } else {
      this.sortOptions.splice(existingOptionIndex, 1);
    }

    this.buildSortFunction();
  }

  /**
   *
   * @param key The column key to look for
   * @returns The sorting options and current index for a given column
   */
  isSortingOnKey(key: string) {
    const index = this.sortOptions.findIndex((option) => option.key === key);
    return index !== -1
      ? { ...this.sortOptions[index], index: index + 1 }
      : null;
  }

  /**
   * Provides a way of setting our search value, without interferring with props
   *
   * @param newValue The new search for value to filter by
   */
  setSearchValue(newValue: string) {
    this.searchValue = newValue;
  }

  /**
   * @param items The items to filter and sort by
   * @param gridConfiguration The grid configuration, used to get item values
   * @returns Items with filtering and sorting
   */
  filterAndSortItems(
    items: any[],
    gridConfiguration: GridConfiguration<any>
  ): AnyWithGridIndex[] {
    if (
      this.searchValue === "" &&
      Object.entries(this.filterChains).length === 0
    ) {
      return items.sort(this.sortFunction);
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

          const filterChain = this.filterChains[column.key];

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

  // Inserts a grid index as a property to all items, with the value of their original index
  // TODO: This is probably wasteful
  injectGridIndexes(items: Record<string, any>[]) {
    return items.map((item, index) => ({
      [gridIndexId]: index,
      ...item,
    }));
  }

  // Creates a new filter
  addNewFilter(column: Column<Record<string, any>, any>) {
    if (!this.filterOptions[column.key]) {
      Vue.set(this.filterOptions, column.key, []);
    }

    this.filterOptions[column.key].push({
      filterFunction: undefined,
      value: undefined,
      operator: undefined,
    });
  }

  // Filter properties should be updated in a "Vue" way to provide correct reactivity, and allow us to rebuild
  // our filters for the column
  setFilterProperty(
    filter: FilterOption<RenderableType>,
    propertyName: keyof FilterOption<RenderableType>,
    value: any,
    columnKey: string
  ) {
    Vue.set(filter, propertyName, value);
    this.buildFilterFunctionsForColumn(columnKey);
  }

  // Deletes a filter at a given pos
  removeFilter(column: Column<Record<string, any>, any>, index: number) {
    this.filterOptions[column.key].splice(index, 1);
    this.buildFilterFunctionsForColumn(column.key);
  }

  // Only valid if all properties are defined, except for the final filter option
  // where "operator" isn't required
  isValidFilterOption(
    options: FilterOption<RenderableType>,
    totalNumberOfOptions: number,
    index: number
  ) {
    if (totalNumberOfOptions === index + 1) {
      return (
        typeof options.filterFunction !== "undefined" &&
        typeof options.value !== "undefined"
      );
    }

    return hasAllProperties(options);
  }

  // Build filter chains as and when a column's filters are changed, rather than rebuild on use
  buildFilterFunctionsForColumn(key: string) {
    const options = this.filterOptions[key];

    if (typeof options === "undefined") {
      return null;
    }

    const filterChain = options?.reduceRight(
      (chain, option, index) => {
        if (this.isValidFilterOption(option, options.length, index)) {
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

    Vue.set(this.filterChains, key, filterChain);
  }
}
