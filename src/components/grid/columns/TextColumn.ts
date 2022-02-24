import {
  Column,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import TextField from "@/components/controls/inputs/TextField.vue";
import TextFilterOptions from "@/components/grid/filters/TextFilterOptions";

/**
 * Optional and column specific properties to configure TextColumn behaviours
 */
export interface TextColumnOptions extends ColumnOptions {}

/**
 * TextColumn type, used when building grids using string fields
 */
export class TextColumn<T> extends Column<T, string> {
  declare options?: Partial<TextColumnOptions>;
  public component = TextField;
  public filterOptions = TextFilterOptions;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, string>,
    options?: Partial<TextColumnOptions>
  ) {
    super(key, itemValue, options);

    this.ascIcon = "mdi-sort-alphabetical-ascending";
    this.descIcon = "mdi-sort-alphabetical-descending";
  }
}
