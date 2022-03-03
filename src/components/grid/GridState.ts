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

const gridIndexId = "_grid-idx";
export type AnyWithGridIdx = { [gridIndexId]: number };

type SortOrder = "asc" | "desc" | -1 | 1;
interface ThenByOpts {
  direction?: SortOrder;
  ignoreCase?: boolean;
}

interface SortOptions {
  key: string;
  options: ThenByOpts;
}
export class GridState {
  sortOptions: SortOptions[] = [];
  searchValue: string = "";
  filterOptions: Record<string, FilterOption<RenderableType>[]> = {};
  filterChains: Record<string, (itemValue: any) => boolean> = {};

  // Instead of a getter, you could build this function only when it changes
  // Not done as it just adds pointless complexity for something that shouldn't be slow anyway
  get sortBy() {
    if (this.sortOptions.length) {
      // If we have anything to sort by
      let sortBy = firstBy(
        this.sortOptions[0].key,
        this.sortOptions[0].options
      );

      this.sortOptions.forEach((opt) => {
        sortBy = sortBy.thenBy(opt.key, opt.options);
      });

      sortBy = sortBy.thenBy("_grid-idx");

      return sortBy;
    }

    // Otherwise, default to original order
    return firstBy("_grid-idx");
  }

  /**
   * Cycles through sorting behaviours for a column
   *
   * @param key The column key to toggle sorting behaviours for
   */
  toggleSort(key: string) {
    const existingOptionIdx = this.sortOptions.findIndex(
      (option) => option.key === key
    );

    // Creates a new sorting option if we don't have one
    if (existingOptionIdx === -1) {
      this.sortOptions.push({
        key,
        options: { direction: "asc" },
      });
      return;
    }

    // Otherwise, progresses or removes
    const existingOption = this.sortOptions[existingOptionIdx];
    if (existingOption.options.direction === "asc") {
      existingOption.options.direction = "desc";
    } else {
      this.sortOptions.splice(existingOptionIdx, 1);
    }
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
  ): AnyWithGridIdx[] {
    if (
      this.searchValue === "" &&
      Object.entries(this.filterChains).length === 0
    ) {
      return items;
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
              console.log(filterChain);
              return false;
            }
          }
        }

        return searchPassed;
      })
      .sort(this.sortBy);
  }

  // Inserts a grid idx as a property to all items, with the value of their original index
  injectGridIndexes(items: any[]) {
    return items.map((item, idx) => ({
      [gridIndexId]: idx,
      ...item,
    }));
  }

  // Creates a new filter
  addNewFilter(column: Column<any, any>) {
    if (!this.filterOptions[column.key]) {
      Vue.set(this.filterOptions, column.key, []);
    }

    this.filterOptions[column.key].push({
      filterFunction: undefined,
      value: undefined,
      operator: undefined,
    });
  }

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
  removeFilter(column: Column<any, any>, index: number) {
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

  buildFilterFunctionsForColumn(key: string) {
    const options = this.filterOptions[key];

    if (typeof options === "undefined") {
      return null;
    }

    const filterChain = options?.reduceRight(
      (chain, option, index) => {
        if (this.isValidFilterOption(option, options.length, index)) {
          console.log(option.operator);
          if (option.operator === FilterOperator.or) {
            console.log("ororor");
            return (itemValue: any) =>
              chain(itemValue) ||
              option.filterFunction!(itemValue, option.value);
          }
          console.log("anannaan");
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
