import {
  Column,
  ColumnOptions,
  GridWidthEnum,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import GridActionView from "@/components/grid/columns/action/GridActionView.vue";
import { RawLocation } from "vue-router";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface ActionColumnOptions extends ColumnOptions {}

export interface ActionDefinition<T> {
  onClick?: (item: T) => void;
  to?: (item: T) => RawLocation;
  text: string;
}

export class ActionColumn<T> extends Column<T, any, ActionColumnOptions> {
  declare options: Partial<ActionColumnOptions>;
  viewRenderer = GridActionView;
  editRenderer = undefined;
  filterOptions = undefined;
  actions: ActionDefinition<T>[] = [];

  constructor(key: string, itemValue: ValueExtractor<T, any>) {
    super(key, itemValue);

    this.setOption("isFilterable", false);
    this.setOption("isSortable", false);
    this.setOption("defaultWidth", GridWidthEnum.SMALL);
  }

  addAction(
    text: ActionDefinition<T>["text"],
    onClick: ActionDefinition<T>["onClick"]
  ) {
    this.actions.push({ onClick, text });

    return this;
  }

  addRoute(text: ActionDefinition<T>["text"], to: ActionDefinition<T>["to"]) {
    this.actions.push({ to, text });

    return this;
  }
}
