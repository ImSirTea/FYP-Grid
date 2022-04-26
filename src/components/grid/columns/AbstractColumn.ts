import { FilterOptions } from "@/components/grid/filters/types";
import { ValidationRule } from "@/components/util/rules";
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
  isSortable: boolean;
  isInteractable: boolean;
  isManageable: boolean;
  hideColumnName: boolean;
  ascIcon: string;
  descIcon: string;
  useRendererForHeader: boolean;
}

export type AnyGridColumn = AbstractColumn<any, any, ColumnOptions>;

export abstract class AbstractColumn<T, U, O extends ColumnOptions> {
  key: string;
  private itemValue: ValueExtractor<T, U>;
  options: Partial<O> = {};
  rules: ValidationRule<U>[] = [];

  abstract renderer: VueConstructor;
  abstract filterOptions?: FilterOptions<any>;

  valueSetter?: (item: T, value: U) => void;

  constructor(key: string, itemValue: ValueExtractor<T, U>) {
    this.key = key;
    this.itemValue = itemValue;

    this.setOptions({
      defaultWidth: GridWidthEnum.MEDIUM,
      defaultPin: "centre",
      defaultHidden: false,
      defaultAlignment: "left",
      isFilterable: true,
      isSortable: true,
      isInteractable: true,
      isManageable: true,
      ascIcon: "mdi-sort-ascending",
      descIcon: "mdi-sort-descending",
      hideColumnName: false,
      useRendererForHeader: false,
    } as Partial<O>);
  }

  // Create a getter function so we can override behaviours if needed, consistently
  value(item: T): U {
    return this.itemValue(item);
  }

  setValue(item: T, value: U) {
    if (this.valueSetter) {
      this.valueSetter(item, value);
    }
  }

  setValueSetter(setter: (item: T, value: U) => void) {
    this.valueSetter = setter;

    return this;
  }

  get isEditable() {
    return !!this.valueSetter;
  }

  // Converts user-friendly to CSS values
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

  setOptions(newOptions: Partial<O>) {
    Object.assign(this.options, newOptions);
    return this;
  }

  addRules(rules: ValidationRule<U>[]) {
    this.rules.push(...rules);
    return this;
  }
}
