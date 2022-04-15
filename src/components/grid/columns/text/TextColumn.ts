import {
  AbstractColumn,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/AbstractColumn";
import GridTextRenderer from "@/components/grid/columns/text/GridTextRenderer.vue";
import TextFilterOptions from "@/components/grid/columns/text/TextFilterOptions";

/**
 * Optional and column specific properties to configure TextColumn behaviours
 */
export interface TextOptions extends ColumnOptions {}

/**
 * TextColumn type, used when building grids using string fields
 */
export class TextColumn<T> extends AbstractColumn<T, string, TextOptions> {
  public renderer = GridTextRenderer;
  public filterOptions = TextFilterOptions;

  constructor(key: string, itemValue: ValueExtractor<T, string>) {
    super(key, itemValue);

    // Apply defaults
    this.setOptions({
      ascIcon: "mdi-sort-alphabetical-ascending",
      descIcon: "mdi-sort-alphabetical-descending",
    });
  }
}
