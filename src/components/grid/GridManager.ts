import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridState } from "@/components/grid/GridState";

/**
 * Wraps column states which can be used consistently across the Grid
 */
export interface ColumnGroups {
  left: AnyGridColumn[];
  centre: AnyGridColumn[];
  right: AnyGridColumn[];
}
export class GridManager {
  #gridState!: GridState;
  #gridConfiguration!: GridConfiguration<any>;

  constructor(gridState: GridState, gridConfiguration: GridConfiguration<any>) {
    this.#gridState = gridState;
    this.#gridConfiguration = gridConfiguration;
  }

  get visibleColumns() {
    return this.#gridConfiguration.columns
      .filter((column) => !this.#gridState.columnStates[column.key].isHidden)
      .sort(this.sortOnOrder);
  }

  get filterableColumns() {
    return this.#gridConfiguration.columns
      .filter((column) => column.options.isFilterable)
      .sort(this.sortOnOrder);
  }

  get manageableColumns() {
    return this.#gridConfiguration.columns
      .filter((column) => column.options.isManageable)
      .sort(this.sortOnOrder);
  }

  get columns() {
    const columns: ColumnGroups = {
      left: [],
      centre: [],
      right: [],
    };

    this.visibleColumns.forEach((column) => {
      const state = this.#gridState.columnStates[column.key];
      columns[state.pin].push(column);
    });

    return columns;
  }

  get sortOnOrder() {
    return (a: AnyGridColumn, b: AnyGridColumn) => {
      const aOrder = this.#gridState.columnStates[a.key].order;
      const bOrder = this.#gridState.columnStates[b.key].order;

      return aOrder - bOrder;
    };
  }

  get columnSizes() {
    const leftWidth = this.columns.left.reduce(
      (acc, column) => acc + this.#gridState.columnStates[column.key].width,
      0
    );
    const centreWidth = this.columns.centre.reduce(
      (acc, column) => acc + this.#gridState.columnStates[column.key].width,
      0
    );
    const rightWidth = this.columns.right.reduce(
      (acc, column) => acc + this.#gridState.columnStates[column.key].width,
      0
    );

    return { leftWidth, centreWidth, rightWidth };
  }
}
