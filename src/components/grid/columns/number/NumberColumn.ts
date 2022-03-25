import {
  Column,
  ColumnOptions,
  ValueExtractor,
  GridWidthEnum,
} from "@/components/grid/columns/Column";
import GridNumberView from "@/components/grid/columns/number/GridNumberView.vue";
import GridNumberEdit from "@/components/grid/columns/number/GridNumberEdit.vue";
import NumberFilterOptions from "@/components/grid/columns/number/NumberFilterOptions";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface NumberColumnOptions extends ColumnOptions {
  max: number;
}

/**
 * NumberColumn type, used when building grids using number fields
 */
export class NumberColumn<T> extends Column<T, number, NumberColumnOptions> {
  public viewRenderer = GridNumberView;
  public editRenderer = GridNumberEdit;
  public filterOptions = NumberFilterOptions;

  constructor(key: string, itemValue: ValueExtractor<T, number>) {
    super(key, itemValue);

    // Apply defaults
    this.setOption("defaultWidth", GridWidthEnum.SMALL);
    this.setOption("ascIcon", "mdi-sort-numeric-ascending");
    this.setOption("descIcon", "mdi-sort-numeric-descending");
  }
}
