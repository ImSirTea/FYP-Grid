import {
  ActionColumn,
  ActionColumnOptions,
} from "@/components/grid/columns/ActionColumn";
import {
  Column,
  ColumnOptions,
  RenderableType,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import {
  NumberColumn,
  NumberColumnOptions,
} from "@/components/grid/columns/NumberColumn";
import {
  TextColumn,
  TextColumnOptions,
} from "@/components/grid/columns/TextColumn";

export class GridConfiguration<T> {
  #columns: Column<T, RenderableType>[] = [];
  #actionColumn?: ActionColumn;

  get columns() {
    if (this.#actionColumn) {
      return this.#columns.concat(this.#actionColumn);
    }

    return this.#columns;
  }

  addTextColumn(
    name: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    const textColumn = new TextColumn(name, itemValue, options);
    this.#columns.push(textColumn);
  }

  addNumberColumn(
    name: string,
    itemValue: ValueExtractor<T, number>,
    options?: Partial<NumberColumnOptions>
  ) {
    const numberColumn = new NumberColumn(name, itemValue, options);
    this.#columns.push(numberColumn);
  }

  withActionColumn(options?: Partial<ActionColumnOptions>) {
    if (this.#actionColumn) {
      throw Error("Action column has already been defined.");
    }

    //const actionColumn = new ActionColumn("actions", itemValue, options);
  }
}
