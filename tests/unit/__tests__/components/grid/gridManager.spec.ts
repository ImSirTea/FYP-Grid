import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import Item from "@/types/item";

describe("GridManager", () => {
  const gridConfiguration = new GridConfiguration<Item>();

  const indexColumn = gridConfiguration
    .addNumberColumn("index", (item) => item.index)
    .setOptions({ defaultPin: "left" });

  const firstNameColumn = gridConfiguration
    .addTextColumn("first1", (item) => item.first + "- 1")
    .setOptions({ defaultHidden: true });

  const actionColumn = gridConfiguration.withActionColumn();
  const selectColumn = gridConfiguration.withSelectColumn();

  const gridState = gridConfiguration.defaultState;
  const gridManager = new GridManager(gridState, gridConfiguration);

  it("Column getts work as expected", () => {
    // Correct number of columns
    expect(gridManager.visibleColumns).toHaveLength(3);

    // Not to find hidden column
    expect(
      gridManager.visibleColumns.find((column) => column === firstNameColumn)
    ).toBeUndefined();

    // Columns in the correct places
    expect(gridManager.columns.left[0]).toBe(selectColumn);
    expect(gridManager.columns.left[1]).toBe(indexColumn);
    expect(gridManager.columns.right[0]).toBe(actionColumn);
  });

  it("Manageable and Filterable", () => {
    // Only index and first name are filterable
    expect(gridManager.filterableColumns).toHaveLength(2);

    // and managable
    expect(gridManager.manageableColumns).toHaveLength(2);
  });

  it("Updates hidden", () => {
    // Not to find hidden column
    expect(
      gridManager.visibleColumns.find((column) => column === firstNameColumn)
    ).toBeUndefined();

    // Changing hidden
    gridState.columnStates[firstNameColumn.key].isHidden = false;

    // First name column should now exist
    expect(
      gridManager.visibleColumns.find((column) => column === firstNameColumn)
    ).toBeDefined();

    // With all columns
    expect(gridManager.visibleColumns).toHaveLength(4);

    // In the correct spot
    expect(gridManager.columns.centre[0]).toBe(firstNameColumn);
  });

  it("Updates pin", () => {
    // Index to be pinned left
    expect(
      gridManager.columns.left.find((column) => column === indexColumn)
    ).toBeDefined();

    // Changing pin
    gridState.columnStates[indexColumn.key].pin = "centre";

    // Index should no longer be in left
    expect(
      gridManager.columns.left.find((column) => column === indexColumn)
    ).toBeUndefined();

    // It should be in centre
    expect(
      gridManager.columns.centre.find((column) => column === indexColumn)
    ).toBeDefined();
  });
});
