import {
  Column,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import GridTextView from "@/components/grid/columns/text/GridTextView.vue";
import GridTextEdit from "@/components/grid/columns/text/GridTextEdit.vue";
import TextFilterOptions from "@/components/grid/columns/text/TextFilterOptions";

/**
 * Optional and column specific properties to configure TextColumn behaviours
 */
export interface TextColumnOptions extends ColumnOptions {}

/**
 * TextColumn type, used when building grids using string fields
 */
export class TextColumn<T> extends Column<T, string> {
  declare options: Partial<TextColumnOptions>;
  public viewRenderer = GridTextView;
  public editRenderer = GridTextEdit;
  public filterOptions = TextFilterOptions;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    super(key, itemValue, options);

    // Apply defaults
    this.options.ascIcon ??= "mdi-sort-alphabetical-ascending";
    this.options.descIcon ??= "mdi-sort-alphabetical-descending";
  }
}
