import { firstBy } from "thenby";

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
  #sortingOptions: SortingOptions[] = [];

  get canSort() {
    return !!this.#sortingOptions.length;
  }

  get sortBy() {
    // If we have anything to sort by
    let sortBy = firstBy(
      this.#sortingOptions[0].key,
      this.#sortingOptions[0].options
    );

    this.#sortingOptions.slice(1).forEach((opt) => {
      sortBy = sortBy.thenBy(opt.key, opt.options);
    });

    return sortBy;
  }

  toggleSort(key: string) {
    const existingOptionIdx = this.#sortingOptions.findIndex(
      (option) => option.key === key
    );

    if (existingOptionIdx === -1) {
      // Creates a new sorting option if we don't have one
      this.#sortingOptions.push({
        key,
        options: { direction: "asc" },
      });
      return;
    }
    // Otherwise, progresses or removes
    const existingOption = this.#sortingOptions[existingOptionIdx];
    if (existingOption.options.direction === "asc") {
      existingOption.options.direction = "desc";
    } else {
      this.#sortingOptions.splice(existingOptionIdx, 1);
    }
  }
}
