import {
  Column,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/Column";

/**
 * Optional and column specific properties to configure TextColumn behaviours
 */
export interface TextColumnOptions extends ColumnOptions {
  truncateTo: number;
}

/**
 * TextColumn type, used when building grids using string fields
 */
export class TextColumn<T> extends Column<T, string> {
  declare options?: Partial<TextColumnOptions>;

  override sortAscIcon = "mdi-sort-alphabetical-ascending";
  override sortDescIcon = "mdi-sort-alphabetical-descending";

  constructor(
    key: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    super(key, itemValue, options);
  }

  override value(item: T): string {
    return this.itemValue(item).substring(0, this.options?.truncateTo);
  }
}
