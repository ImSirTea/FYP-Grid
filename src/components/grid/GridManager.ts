import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { ColumnState, GridState } from "@/components/grid/GridState";

/**
 * Wraps column states which can be used consistently across the Grid
 */

export interface ColumnWithState {
  definition: AnyGridColumn;
  state: ColumnState;
}
export interface ColumnGroups {
  left: ColumnWithState[];
  centre: ColumnWithState[];
  right: ColumnWithState[];
}
export class GridManager {
  #gridState!: GridState;
  #gridConfiguration!: GridConfiguration<any>;

  constructor(gridState: GridState, gridConfiguration: GridConfiguration<any>) {
    this.#gridState = gridState;
    this.#gridConfiguration = gridConfiguration;
  }

  get columns() {
    const columns: ColumnGroups = {
      left: [],
      centre: [],
      right: [],
    };

    this.#gridConfiguration.columns.sort(this.sortOnOrder).forEach((column) => {
      const state = this.#gridState.columnStates[column.key];
      columns[state.pin].push({ definition: column, state });
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
      (acc, column) => acc + column.state.width,
      0
    );
    const centreWidth = this.columns.centre.reduce(
      (acc, column) => acc + column.state.width,
      0
    );
    const rightWidth = this.columns.right.reduce(
      (acc, column) => acc + column.state.width,
      0
    );

    return { leftWidth, centreWidth, rightWidth };
  }
}
