import { FilterOptions } from "@/components/grid/filters/types";
import { VueConstructor } from "vue";

/** General Types */
export type ValueExtractor<T, U> = (item: T) => U;
// export type ValueEditor<T, U> = (item: T, key: , value: U) => void;

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
  defaultAlignment: PinTypes;
  isFilterable: boolean;
  isDraggable: boolean;
  isSortable: boolean;
  isResizeable: boolean;
  ascIcon: string;
  descIcon: string;
}

// Would like to look into this, not a fan
export type AnyGridColumn = AbstractColumn<any, any, ColumnOptions>;

export abstract class AbstractColumn<T, U, O extends ColumnOptions> {
  key: string;
  private itemValue: ValueExtractor<T, U>;
  private boundProperty?: keyof T; //ValueEditor<T, T[key]>;
  options: Partial<O> = {};

  abstract viewRenderer: VueConstructor;
  abstract editRenderer?: VueConstructor;
  abstract filterOptions?: FilterOptions<any>;

  constructor(key: string, itemValue: ValueExtractor<T, U>) {
    this.key = key;
    this.itemValue = itemValue;

    this.setOption("isFilterable", true);
    this.setOption("isSortable", true);
    this.setOption("isDraggable", true);
    this.setOption("isResizeable", true);
    this.setOption("defaultWidth", GridWidthEnum.MEDIUM);
    this.setOption("defaultHidden", false);
    this.setOption("defaultPin", "centre");
    this.setOption("defaultAlignment", "left");
    this.setOption("ascIcon", "mdi-sort-ascending");
    this.setOption("descIcon", "mdi-sort-descending");
  }

  // Create a getter function so we can override behaviours if needed, consistently
  value(item: T): U {
    return this.itemValue(item);
  }

  setValue(item: T, value: U) {
    if (this.isEditable) {
      const propertyName = this.boundProperty!.toString();
      item[propertyName] = value;
    }
  }

  get isEditable() {
    return !!this.boundProperty;
  }

  get alignment() {
    switch (this.options.defaultAlignment) {
      case "left":
      default:
        return "start";

      case "centre":
        return "center";

      case "right":
        return "end";
    }
  }

  setOption<K extends keyof O>(name: K, value: O[K]) {
    this.options[name] = value;
    return this;
  }

  setViewRenderer(newRenderer: VueConstructor<Vue>) {
    this.viewRenderer = newRenderer;
  }

  bindProperty(property: keyof T) {
    this.boundProperty = property;
  }
}
