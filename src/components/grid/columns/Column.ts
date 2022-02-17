/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;

export enum WidthEnum {
  SMALL = 20,
  MEDIUM = 50,
  LARGE = 100,
  XLARGE = 200,
}

export interface ColumnOptions {
  width: WidthEnum | number;
}

export abstract class Column<T, U> {
  key: string;
  itemValue: ValueExtractor<T, U>;
  options?: Partial<ColumnOptions>;
  defaultWidth: WidthEnum = WidthEnum.MEDIUM;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, U>,
    options?: Partial<ColumnOptions>
  ) {
    this.key = key;
    this.itemValue = itemValue;
    this.options = options;
  }

  value(item: T): U {
    return this.itemValue(item);
  }

  get width() {
    return this.options?.width ?? this.defaultWidth;
  }

  get widthWithUnit() {
    return this.width + "ch";
  }
}
