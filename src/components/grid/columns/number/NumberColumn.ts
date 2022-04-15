import {
  AbstractColumn,
  ColumnOptions,
  ValueExtractor,
  GridWidthEnum,
} from "@/components/grid/columns/AbstractColumn";
import GridNumberRenderer from "@/components/grid/columns/number/GridNumberRenderer.vue";
import GridNumberEdit from "@/components/grid/columns/number/GridNumberEdit.vue";
import NumberFilterOptions from "@/components/grid/columns/number/NumberFilterOptions";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface NumberOptions extends ColumnOptions {
  max: number;
}

/**
 * NumberColumn type, used when building grids using number fields
 */
export class NumberColumn<T> extends AbstractColumn<T, number, NumberOptions> {
  public renderer = GridNumberRenderer;
  public filterOptions = NumberFilterOptions;

  constructor(key: string, itemValue: ValueExtractor<T, number>) {
    super(key, itemValue);

    // Apply defaults
    this.setOptions({
      defaultWidth: GridWidthEnum.SMALL,
      ascIcon: "mdi-sort-numeric-ascending",
      descIcon: "mdi-sort-numeric-descending",
      defaultAlignment: "centre",
    });
  }
}
