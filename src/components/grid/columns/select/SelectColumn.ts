import {
  AbstractColumn,
  ColumnOptions,
  GridWidthEnum,
  ValueExtractor,
} from "@/components/grid/columns/AbstractColumn";
import GridSelectView from "@/components/grid/columns/select/GridSelectView.vue";

export interface SelectColumnOptions extends ColumnOptions {}

export class SelectColumn<T> extends AbstractColumn<
  T,
  boolean,
  SelectColumnOptions
> {
  public viewRenderer = GridSelectView;
  public editRenderer = undefined;
  public filterOptions = undefined;

  constructor(key: string, itemValue: ValueExtractor<T, boolean>) {
    super(key, itemValue);

    this.setOption("isFilterable", false);
    this.setOption("isSortable", false);
    this.setOption("defaultWidth", GridWidthEnum.SMALL);
    this.setOption("defaultPin", "left");
  }
}
