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

    this.setOptions({
      isFilterable: false,
      isSortable: false,
      isInteractable: false,
      isManageable: false,
      useRendererForHeader: true,
      defaultWidth: 40,
      defaultPin: "left",
      defaultAlignment: "centre",
      hideColumnName: true,
    });
  }
}
