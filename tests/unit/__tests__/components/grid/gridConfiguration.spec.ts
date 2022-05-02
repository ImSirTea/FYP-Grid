import {
  ActionColumn,
  ActionDefinition,
} from "@/components/grid/columns/action/ActionColumn";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import Item from "@/types/item";

describe("GridConfiguration", () => {
  let gridConfiguration = new GridConfiguration<Item>();

  // Reset grid config before each
  beforeEach(() => {
    gridConfiguration = new GridConfiguration<Item>();
  });

  it("Adds a text and number column", () => {
    // Adding a text column
    gridConfiguration.addTextColumn("Text", (item) => item.first);
    expect(gridConfiguration.columns).toHaveLength(1);

    // Adding a number column
    gridConfiguration.addNumberColumn("Number", (item) => item.index);
    expect(gridConfiguration.columns).toHaveLength(2);
  });

  it("Adds an action column", () => {
    // Adding an action column
    const actionColumn = gridConfiguration.withActionColumn();
    expect(gridConfiguration.columns).toHaveLength(1);

    // Action column has correct actions
    actionColumn
      .addAction("Text Action", () => "Text Action")
      .addRoute("Text Action", () => "/");
    expect(actionColumn.actions[0]).toHaveProperty("onClick");
    expect(actionColumn.actions[0]).not.toHaveProperty("to");
    expect(actionColumn.actions[1]).toHaveProperty("to");
    expect(actionColumn.actions[1]).not.toHaveProperty("onClick");

    // Expect action column to be last column
    gridConfiguration.addNumberColumn("Number", (item) => item.index);
    expect(
      gridConfiguration.columns[gridConfiguration.columns.length - 1]
    ).toBe(actionColumn);

    // Can't add multiple
    expect(gridConfiguration.withActionColumn).toThrow();

    // Action column should always be unmanageable, unfilterable, unsortable,
    // have a hidden name, and pinned left
    expect(actionColumn.options.defaultPin).toEqual("right");
    expect(actionColumn.options.isManageable).toEqual(false);
    expect(actionColumn.options.isFilterable).toEqual(false);
    expect(actionColumn.options.isSortable).toEqual(false);
    expect(actionColumn.options.hideColumnName).toEqual(true);
  });

  it("Adds a selection column", () => {
    // Used to test adding select after still puts it first
    gridConfiguration.addNumberColumn("Number", (item) => item.index);

    // Adding an action column
    const selectColumn = gridConfiguration.withSelectColumn();
    expect(gridConfiguration.columns).toHaveLength(2);

    // Expect select column to be first column
    expect(gridConfiguration.columns[0]).toBe(selectColumn);

    // Select column should always be unmanageable, unfilterable, unsortable,
    // have a hidden name, and pinned left
    expect(selectColumn.options.defaultPin).toEqual("left");
    expect(selectColumn.options.isManageable).toEqual(false);
    expect(selectColumn.options.isFilterable).toEqual(false);
    expect(selectColumn.options.isSortable).toEqual(false);
    expect(selectColumn.options.hideColumnName).toEqual(true);
  });

  it("Adds a row action... action", () => {
    // Adding an action column
    gridConfiguration.withRowAction(() => "Row Action");
    expect(gridConfiguration.rowAction).toBeDefined();
    expect(gridConfiguration.rowRoute).not.toBeDefined();

    // Cannot add another row action / row route
    expect(() => gridConfiguration.withRowAction(() => "Row Action")).toThrow();
    expect(() => gridConfiguration.withRowRoute(() => "/")).toThrow();
  });

  it("Adds a row route action", () => {
    // Adding an action column
    gridConfiguration.withRowRoute(() => "/");
    expect(gridConfiguration.rowRoute).toBeDefined();
    expect(gridConfiguration.rowAction).not.toBeDefined();

    // Cannot add another row action / row route
    expect(() => gridConfiguration.withRowRoute(() => "/")).toThrow();
    expect(() => gridConfiguration.withRowAction(() => "Row Action")).toThrow();
  });
});
