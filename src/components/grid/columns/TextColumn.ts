import {
  Column,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/Column";

/**
 * Optional and column specific properties to configure TextColumn behaviours
 */
export interface TextColumnOptions extends ColumnOptions {}

/**
 * TextColumn type, used when building grids using string fields
 */
export class TextColumn<T> extends Column<T, string> {
  declare options?: Partial<TextColumnOptions>;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    super(key, itemValue, options);

    this.ascIcon = "mdi-sort-alphabetical-ascending";
    this.descIcon = "mdi-sort-alphabetical-descending";
  }
}
