import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridState } from "@/components/grid/GridState";

/**
 * Wraps column states which can be used consistently across the Grid
 */
export class GridManager {
  #gridState!: GridState;
  #gridConfiguration!: GridConfiguration<any>;

  constructor(gridState: GridState, gridConfiguration: GridConfiguration<any>) {
    this.#gridState = gridState;
    this.#gridConfiguration = gridConfiguration;
  }

  get visibleColumns() {
    return this.#gridConfiguration.columns.filter(
      (column) => !this.#gridState.columnStates[column.key].isHidden
    );
  }

  get filterableColumns() {
    return this.#gridConfiguration.columns.filter(
      (column) => column.options.isFilterable
    );
  }
}
