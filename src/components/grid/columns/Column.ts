import { FilterOptions } from "@/components/grid/filters/types";
import { Component } from "vue";

/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;

export enum GridWidthEnum {
  SMALL = 50,
  MEDIUM = 100,
  LARGE = 200,
  XLARGE = 350,
}

export enum SortDirection {
  NONE,
  ASCENDING,
  DESCENDING,
}

export interface ColumnOptions {
  defaultWidth: GridWidthEnum | number;
  defaultPin: "left" | "right";
  filterable: boolean;
  ascIcon: string;
  descIcon: string;
}

// Would like to look into this, not a fan
export type RenderableType = string | number | boolean; // Could be { toString(): string }?
export type AnyGridItem = Record<string, any>;
export type AnyGridColumn = Column<AnyGridItem, any>;

export abstract class Column<T, RenderableType> {
  key: string;
  #itemValue: ValueExtractor<T, RenderableType>;
  options: Partial<ColumnOptions> = {};

  abstract renderer?: Component;
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
    this.options.defaultWidth ??= GridWidthEnum.MEDIUM;
  }

  value(item: T): RenderableType {
    return this.#itemValue(item);
  }

  get ascIcon() {
    return this.options.ascIcon ?? "mdi-sort-ascending";
  }

  get descIcon() {
    return this.options.ascIcon ?? "mdi-sort-descending";
  }
}
