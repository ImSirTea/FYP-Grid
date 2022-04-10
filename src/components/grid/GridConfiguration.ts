import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import {
  Column,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { GridState } from "@/components/grid/GridState";
import $tc from "@/textConstants";
import { RawLocation } from "vue-router";

type RowRoute<T> = (item: T) => RawLocation;
type RowAction<T> = (item: T) => void;

export class GridConfiguration<T> {
  #columns: Column<T, any, ColumnOptions>[] = [];
  #actionColumn?: ActionColumn<T>;
  rowAction?: RowAction<T>;
  rowRoute?: RowRoute<T>;

  get columns() {
    if (this.#actionColumn) {
      return this.#columns.concat(this.#actionColumn);
    }

    return this.#columns;
  }

  get defaultState(): GridState {
    const gridState = new GridState();

    this.columns.forEach((column, index) => {
      gridState.columnStates[column.key] = {
        width: column.options.defaultWidth!,
        pin: column.options.defaultPin!,
        isHidden: column.options.defaultHidden!,
        order: index,
        filterOptions: [],
        filterChain: undefined,
      };
    });

    return gridState;
  }

  addTextColumn(
    name: string,
    itemValue: ValueExtractor<T, string>
  ): TextColumn<T> {
    const textColumn = new TextColumn(name, itemValue);
    this.#columns.push(textColumn);

    return textColumn;
  }

  addNumberColumn(
    name: string,
    itemValue: ValueExtractor<T, number>
  ): NumberColumn<T> {
    const numberColumn = new NumberColumn(name, itemValue);
    this.#columns.push(numberColumn);

    return numberColumn;
  }

  withActionColumn(name: string = $tc.actions.toLowerCase()): ActionColumn<T> {
    if (this.#actionColumn) {
      throw Error("Action column has already been defined.");
    }

    this.#actionColumn = new ActionColumn(name, () => null);

    return this.#actionColumn;
  }

  withRowAction(action: RowAction<T>): void {
    if (this.rowAction || this.rowRoute) {
      throw Error("A row action or route has already been defined.");
    }

    this.rowAction = action;
  }

  withRowRoute(route: RowRoute<T>): void {
    if (this.rowAction || this.rowRoute) {
      throw Error("A row action or route has already been defined.");
    }

    this.rowRoute = route;
  }
}
