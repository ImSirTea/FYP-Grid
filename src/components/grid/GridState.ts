import { firstBy } from "thenby";
import AnyWithGridIdx from "@/components/grid/Grid.vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";

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

  isSortingOnKey(key: string) {
    const index = this.sortingOptions.findIndex((option) => option.key === key);
    return index !== -1
      ? { ...this.sortingOptions[index], index: index + 1 }
      : null;
  }

  setSearchValue(newValue: string) {
    this.searchValue = newValue;
  }
}
