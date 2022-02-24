import {
  Column,
  ColumnOptions,
  ValueExtractor,
  GridWidthEnum,
} from "@/components/grid/columns/Column";
import NumberField from "@/components/controls/inputs/NumberField.vue";
import NumberFilterOptions from "@/components/grid/filters/NumberFilterOptions";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface NumberColumnOptions extends ColumnOptions {}

/**
 * NumberColumn type, used when building grids using number fields
 */
export class NumberColumn<T> extends Column<T, number> {
  declare options?: Partial<NumberColumnOptions>;
  public component = NumberField;
  public filterOptions = NumberFilterOptions;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, number>,
    options?: Partial<NumberColumnOptions>
  ) {
    super(key, itemValue, options);

    this.defaultWidth = GridWidthEnum.SMALL;
    this.ascIcon = "mdi-sort-numeric-ascending";
    this.descIcon = "mdi-sort-numeric-descending";
  }
}
