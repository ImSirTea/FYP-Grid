import { AnyGridColumn } from "@/components/grid/columns/Column";
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
    return this.#gridConfiguration.columns
      .filter((column) => !this.#gridState.columnStates[column.key].isHidden)
      .sort(this.sortOnOrder);
  }

  get filterableColumns() {
    return this.#gridConfiguration.columns
      .filter((column) => column.options.isFilterable)
      .sort(this.sortOnOrder);
  }

  get sortOnOrder() {
    return (a: AnyGridColumn, b: AnyGridColumn) => {
      const aOrder = this.#gridState.columnStates[a.key].order;
      const bOrder = this.#gridState.columnStates[b.key].order;

      return aOrder - bOrder;
    };
  }
}
