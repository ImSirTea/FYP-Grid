import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import {
  Column,
  ColumnOptions,
  RenderableType,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import $tc from "@/textConstants";

export class GridConfiguration<T> {
  #columns: Column<T, RenderableType, ColumnOptions>[] = [];
  #actionColumn?: ActionColumn<T>;

  get columns() {
    if (this.#actionColumn) {
      return this.#columns.concat(this.#actionColumn);
    }

    return this.#columns;
  }

  addTextColumn(name: string, itemValue: ValueExtractor<T, string>) {
    const textColumn = new TextColumn(name, itemValue);
    this.#columns.push(textColumn);

    return textColumn;
  }

  addNumberColumn(name: string, itemValue: ValueExtractor<T, number>) {
    const numberColumn = new NumberColumn(name, itemValue);
    this.#columns.push(numberColumn);

    return numberColumn;
  }

  withActionColumn(name: string = $tc.actions.toLowerCase()) {
    if (this.#actionColumn) {
      throw Error("Action column has already been defined.");
    }

    this.#actionColumn = new ActionColumn(name, () => null);

    return this.#actionColumn;
  }
}
