import {
  Column,
  ColumnOptions,
  ValueExtractor,
  GridWidthEnum,
} from "@/components/grid/columns/Column";
import GridNumberView from "@/components/grid/columns/Number/GridNumberView.vue";
import GridNumberEdit from "@/components/grid/columns/Number/GridNumberEdit.vue";
import NumberFilterOptions from "@/components/grid/columns/number/NumberFilterOptions";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface NumberColumnOptions extends ColumnOptions {}

/**
 * NumberColumn type, used when building grids using number fields
 */
export class NumberColumn<T> extends Column<T, number> {
  declare options: Partial<NumberColumnOptions>;
  public viewRenderer = GridNumberView;
  public editRenderer = GridNumberEdit;
  public filterOptions = NumberFilterOptions;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, number>,
    options?: Partial<NumberColumnOptions>
  ) {
    super(key, itemValue, options);

    // Apply defaults
    this.options.defaultWidth ??= GridWidthEnum.SMALL;
    this.options.ascIcon ??= "mdi-sort-numeric-ascending";
    this.options.descIcon ??= "mdi-sort-numeric-descending";
  }
}
