import {
  Column,
  ColumnOptions,
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
  #columns: Column<T, any>[] = [];

  get columns() {
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
}
