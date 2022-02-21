/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;

export enum WidthEnum {
  SMALL = 20,
  MEDIUM = 50,
  LARGE = 100,
  XLARGE = 200,
}

export enum SortDirection {
  NONE,
  ASCENDING,
  DESCENDING,
}

export interface SortOptions {
  ascIcon: string;
  descIcon: string;
  direction: SortDirection;
}

export interface ColumnOptions {
  width: WidthEnum | number;
}

export type RenderableType = string | number | boolean; // Could be { toString(): string }?

export abstract class Column<T, RenderableType> {
  key: string;
  #itemValue: ValueExtractor<T, RenderableType>;
  options?: Partial<ColumnOptions>;
  defaultWidth: WidthEnum = WidthEnum.MEDIUM;
  ascIcon = "mdi-sort-ascending";
  descIcon = "mdi-sort-descending";

  constructor(
    key: string,
    itemValue: ValueExtractor<T, RenderableType>,
    options?: Partial<ColumnOptions>
  ) {
    this.key = key;
    this.#itemValue = itemValue;
    this.options = options;
  }

  value(item: T): RenderableType {
    return this.#itemValue(item);
  }

  get width() {
    return this.options?.width ?? this.defaultWidth;
  }

  get widthWithUnit() {
    return this.width + "ch";
  }
}
