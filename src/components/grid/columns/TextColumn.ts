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

  constructor(
    name: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    super(name, itemValue, options);
  }

  override value(item: T): string {
    return this.itemValue(item).substring(0, this.options?.truncateTo);
  }
}
