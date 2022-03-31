import { FilterOptions } from "@/components/grid/filters/types";
import { Component } from "vue";

/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;

export enum GridWidthEnum {
  SMALL = 100,
  MEDIUM = 200,
  LARGE = 400,
  XLARGE = 750,
}

export enum SortDirection {
  NONE,
  ASCENDING,
  DESCENDING,
}

export interface ColumnOptions {
  defaultWidth: GridWidthEnum | number;
  defaultPin: "left" | "right" | "none";
  defaultHidden: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  ascIcon: string;
  descIcon: string;
}

// Would like to look into this, not a fan
export type RenderableType = string | number | boolean; // Could be { toString(): string }?
export type AnyGridItem = Record<string, any>;
export type AnyGridColumn = Column<AnyGridItem, any, ColumnOptions>;

export abstract class Column<T, RenderableType, O extends ColumnOptions> {
  key: string;
  private itemValue: ValueExtractor<T, RenderableType>;
  options: Partial<O> = {};

  abstract viewRenderer: Component;
  abstract editRenderer?: Component;
  abstract filterOptions?: FilterOptions<any>;

  constructor(key: string, itemValue: ValueExtractor<T, RenderableType>) {
    this.key = key;
    this.itemValue = itemValue;

    this.setOption("isFilterable", true);
    this.setOption("isSortable", true);
    this.setOption("defaultWidth", GridWidthEnum.MEDIUM);
    this.setOption("defaultHidden", false);
    this.setOption("defaultPin", "none");
    this.setOption("ascIcon", "mdi-sort-ascending");
    this.setOption("descIcon", "mdi-sort-descending");
  }

  // Create a getter function so we can override behaviours if needed, consistently
  value(item: T): RenderableType {
    return this.itemValue(item);
  }

  setOption<K extends keyof O>(key: K, value: O[K]) {
    this.options[key] = value;
    return this;
  }
}
