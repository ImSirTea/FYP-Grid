import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { firstBy } from "thenby";

const gridIndexId = "_grid-idx";
export type AnyWithGridIdx = { [gridIndexId]: number };

type SortOrder = "asc" | "desc" | -1 | 1;
interface ThenByOpts {
  direction?: SortOrder;
  ignoreCase?: boolean;
}

interface SortingOptions {
  key: string;
  options: ThenByOpts;
}

export class GridState {
  sortingOptions: SortingOptions[] = [];
  searchValue: string = "";

  get sortBy() {
    if (this.sortingOptions.length) {
      // If we have anything to sort by
      let sortBy = firstBy(
        this.sortingOptions[0].key,
        this.sortingOptions[0].options
      );

      this.sortingOptions.forEach((opt) => {
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
    const existingOptionIdx = this.sortingOptions.findIndex(
      (option) => option.key === key
    );

    // Creates a new sorting option if we don't have one
    if (existingOptionIdx === -1) {
      this.sortingOptions.push({
        key,
        options: { direction: "asc" },
      });
      return;
    }

    // Otherwise, progresses or removes
    const existingOption = this.sortingOptions[existingOptionIdx];
    if (existingOption.options.direction === "asc") {
      existingOption.options.direction = "desc";
    } else {
      this.sortingOptions.splice(existingOptionIdx, 1);
    }
  }

  /**
   *
   * @param key The column key to look for
   * @returns The sorting options and current index for a given column
   */
  isSortingOnKey(key: string) {
    const index = this.sortingOptions.findIndex((option) => option.key === key);
    return index !== -1
      ? { ...this.sortingOptions[index], index: index + 1 }
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
   * @returns Items with grid sorting indexes, then applies filtering and sorting
   */
  filterAndSortItems(
    items: any[],
    gridConfiguration: GridConfiguration<any>
  ): AnyWithGridIdx[] {
    return items
      .map((item, idx) => ({
        [gridIndexId]: idx,
        ...item,
      }))
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
}
