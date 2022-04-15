import {
  AbstractColumn,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/AbstractColumn";
import GridSelectRenderer from "@/components/grid/columns/select/GridSelectRenderer.vue";

export interface SelectOptions extends ColumnOptions {}

export class SelectColumn<T> extends AbstractColumn<T, boolean, SelectOptions> {
  public renderer = GridSelectRenderer;
  public filterOptions = undefined;

  constructor(key: string, itemValue: ValueExtractor<T, boolean>) {
    super(key, itemValue);

    this.setOption("isFilterable", false);
    this.setOption("isSortable", false);
    this.setOption("defaultWidth", 50);
    this.setOption("defaultPin", "left");
    this.setOption("defaultAlignment", "centre");
  }
}
