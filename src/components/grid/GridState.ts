import { Column, RenderableType } from "@/components/grid/columns/Column";
import { FilterOption } from "@/components/grid/filters/types";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
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
  filterOptions: { [key: string]: FilterOption<RenderableType>[] } = {};

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
    return items
      .filter((item) =>
        gridConfiguration.columns.reduce(
          (isValid, column) => {
            const itemValueForColumn = column
              .value(item)
              .toString()
              .toLowerCase()
              .trim();

            const searchByValue = this.searchValue.toLowerCase().trim();

            return isValid || itemValueForColumn.includes(searchByValue);
          },
          false as boolean // ??? Thanks TypeScript
        )
      )
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
      condition: undefined,
      value: undefined,
      connection: undefined,
    });
  }

  setFilter(filter: FilterOption<any>, newFilter: Partial<FilterOption<any>>) {
    Object.assign(filter, newFilter);
  }

  removeFilter(column: Column<any, any>, index: number) {
    this.filterOptions[column.key].splice(index, 1);
    console.log(index);
  }
}
