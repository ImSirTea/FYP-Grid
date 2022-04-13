import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import {
  AnyGridColumn,
  ValueExtractor,
} from "@/components/grid/columns/AbstractColumn";
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { GridState } from "@/components/grid/GridState";
import $tc from "@/textConstants";
import { RawLocation } from "vue-router";
import { SelectColumn } from "@/components/grid/columns/select/SelectColumn";

type RowRoute<T> = (item: T) => RawLocation;
type RowAction<T> = (item: T) => void;

export class GridConfiguration<T> {
  #columns: AnyGridColumn[] = [];
  #actionColumn?: ActionColumn<T>;
  #selectColumn?: SelectColumn<T>;
  rowAction?: RowAction<T>;
  rowRoute?: RowRoute<T>;
  allowRowSelection: boolean = false;

  get columns(): AnyGridColumn[] {
    const allColumns = [
      this.#selectColumn,
      ...this.#columns,
      this.#actionColumn,
    ].filter((column) => column !== undefined);
    return allColumns as AnyGridColumn[];
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

  withSelectColumn(): SelectColumn<T> {
    this.#selectColumn = new SelectColumn<T>("", () => true);

    return this.#selectColumn;
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
