import { FilterOptions } from "@/components/grid/filters/types";
import { AnyWithGridIndex } from "@/components/grid/GridState";
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

// Exportable pin values so we can use them in the pin manager
export const pinValues = ["left", "centre", "right"] as const;
export type PinTypes = typeof pinValues[number];

export interface ColumnOptions {
  defaultWidth: GridWidthEnum | number;
  defaultPin: PinTypes;
  defaultHidden: boolean;
  isFilterable: boolean;
  isDraggable: boolean;
  isSortable: boolean;
  isResizeable: boolean;
  ascIcon: string;
  descIcon: string;
}

// Would like to look into this, not a fan
export type RenderableType = string | number | boolean; // Could be { toString(): string }?
export type AnyGridColumn = Column<
  AnyWithGridIndex,
  RenderableType,
  ColumnOptions
>;

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
    this.setOption("isDraggable", true);
    this.setOption("isResizeable", true);
    this.setOption("defaultWidth", GridWidthEnum.MEDIUM);
    this.setOption("defaultHidden", false);
    this.setOption("defaultPin", "centre");
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
