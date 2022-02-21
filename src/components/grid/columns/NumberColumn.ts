import {
  Column,
  ColumnOptions,
  ValueExtractor,
  WidthEnum,
} from "@/components/grid/columns/Column";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface NumberColumnOptions extends ColumnOptions {}

/**
 * NumberColumn type, used when building grids using number fields
 */
export class NumberColumn<T> extends Column<T, number> {
  declare options?: Partial<NumberColumnOptions>;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, number>,
    options?: Partial<NumberColumnOptions>
  ) {
    super(key, itemValue, options);

    this.defaultWidth = WidthEnum.SMALL;
    this.ascIcon = "mdi-sort-numeric-ascending";
    this.descIcon = "mdi-sort-numeric-descending";
  }
}
