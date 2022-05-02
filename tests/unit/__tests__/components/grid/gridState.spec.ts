import NumberFilterOptions from "@/components/grid/columns/number/NumberFilterOptions";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Item, { buildItems } from "@/types/item";
import $tc from "@/textConstants";
import { FilterOperator, FilterOption } from "@/components/grid/filters/types";

describe("GridState", () => {
  const gridConfiguration = new GridConfiguration<Item>();
  const indexColumn = gridConfiguration.addNumberColumn(
    "index",
    (item) => item.index
  );
  const gridState = gridConfiguration.defaultState;

  const items = buildItems(50);
  const injectedItems = gridState.injectGridIndexes(items);

  it("Tests search values", () => {
    // No valid case
    gridState.searchValue = "AStringThatIsntValid";

    let boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(boundedItems).toHaveLength(0);

    // Only lines with "9"
    gridState.searchValue = "9";

    boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(boundedItems).toHaveLength(5);

    // Resetting shows all
    gridState.searchValue = "";
    boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(boundedItems).toHaveLength(50);
  });

  it("Sorting Functionality", () => {
    // Ascending
    gridState.toggleSort(indexColumn);
    const ascendingItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    ) as unknown as Item[];

    expect(
      ascendingItems.every((item, index) => {
        if (index - 1 <= 0) {
          return true;
        }

        return item.index >= ascendingItems[index - 1].index;
      })
    ).toBe(true);

    // Descending
    gridState.toggleSort(indexColumn);
    const descendingItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    ) as unknown as Item[];

    expect(
      descendingItems.every((item, index) => {
        if (index - 1 <= 0) {
          return true;
        }

        return item.index <= descendingItems[index - 1].index;
      })
    ).toBe(true);

    // Returns to normal
    gridState.toggleSort(indexColumn);
    const originalOrder = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    ) as unknown as Item[];

    expect(
      originalOrder.every((item, index) => item.index === items[index].index)
    ).toBe(true);
  });

  it("Filter Functionality", () => {
    // We can add new filters
    gridState.addNewFilter(indexColumn);
    gridState.addNewFilter(indexColumn);
    expect(
      Object.values(gridState.columnStates[indexColumn.key].filterOptions)
    ).toHaveLength(2);

    // They will filter between bounds
    const greaterThanFilter: FilterOption<number> = {
      condition: NumberFilterOptions.conditions.find(
        (condition) => condition.name === $tc.greaterThan
      )!,
      operator: FilterOperator.and,
      value: 10,
    };

    const lessThanFilter: FilterOption<number> = {
      condition: NumberFilterOptions.conditions.find(
        (condition) => condition.name === $tc.lessThan
      )!,
      value: 30,
    };

    Object.assign(
      gridState.columnStates[indexColumn.key].filterOptions[0],
      greaterThanFilter
    );

    Object.assign(
      gridState.columnStates[indexColumn.key].filterOptions[1],
      lessThanFilter
    );

    gridState.buildFilterFunctionsForColumn(indexColumn.key);

    let boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(
      boundedItems.every((indexedItem) => {
        const item = indexedItem as unknown as Item;
        return item.index >= 10 && item.index <= 30;
      })
    ).toBe(true);

    // Won't filter with invalid filters
    greaterThanFilter.value = undefined;

    Object.assign(
      gridState.columnStates[indexColumn.key].filterOptions[0],
      greaterThanFilter
    );

    gridState.buildFilterFunctionsForColumn(indexColumn.key);

    boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(
      boundedItems.every((indexedItem) => {
        const item = indexedItem as unknown as Item;
        return item.index >= 10 && item.index <= 30;
      })
    ).toBe(false);

    // Deleting a filter will remove the correct one
    // First filter is greater than, so we would expect less than filter to remain
    gridState.removeFilter(indexColumn, 0);

    boundedItems = gridState.filterAndSortItems(
      injectedItems,
      gridConfiguration
    );

    expect(
      boundedItems.every((indexedItem) => {
        const item = indexedItem as unknown as Item;
        return item.index <= 30;
      })
    ).toBe(true);

    // Removing a filter should remove it
    gridState.removeFilter(indexColumn, 0);
    expect(
      Object.values(gridState.columnStates[indexColumn.key].filterOptions)
    ).toHaveLength(0);
  });
});
