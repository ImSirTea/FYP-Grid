import { FilterOptions } from "@/components/grid/filters/types";
import { Component } from "vue";

/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;

export enum GridWidthEnum {
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

export interface ColumnOptions {
  defaultWidth: GridWidthEnum | number;
  filterable: boolean;
  ascIcon: string;
  descIcon: string;
}

// Would like to look into this, not a fan
export type RenderableType = string | number | boolean; // Could be { toString(): string }?

export abstract class Column<T, RenderableType> {
  key: string;
  #itemValue: ValueExtractor<T, RenderableType>;
  options: Partial<ColumnOptions> = {};

  abstract component?: Component;
  abstract filterOptions?: FilterOptions<any>;

  constructor(
    key: string,
    itemValue: ValueExtractor<T, RenderableType>,
    options?: Partial<ColumnOptions>
  ) {
    this.key = key;
    this.#itemValue = itemValue;
    this.options = options ?? {};
    this.options.filterable ??= true;
  }

  value(item: T): RenderableType {
    return this.#itemValue(item);
  }

  get width() {
    return this.options.defaultWidth ?? GridWidthEnum.MEDIUM;
  }

  get ascIcon() {
    return this.options.ascIcon ?? "mdi-sort-ascending";
  }

  get descIcon() {
    return this.options.descIcon ?? "mdi-sort-descending";
  }

  get widthWithUnit() {
    return this.width + "ch";
  }
}
