import {
  AbstractColumn,
  ColumnOptions,
  ValueExtractor,
} from "@/components/grid/columns/AbstractColumn";
import GridActionRenderer from "@/components/grid/columns/action/GridActionRenderer.vue";
import { RawLocation } from "vue-router";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface ActionOptions extends ColumnOptions {}

export interface ActionDefinition<T> {
  onClick?: (item: T) => void;
  to?: (item: T) => RawLocation;
  text: string;
}

export class ActionColumn<T> extends AbstractColumn<T, null, ActionOptions> {
  public renderer = GridActionRenderer;
  public filterOptions = undefined;
  public actions: ActionDefinition<T>[] = [];

  constructor(key: string, itemValue: ValueExtractor<T, null>) {
    super(key, itemValue);

    this.setOptions({
      isFilterable: false,
      isSortable: false,
      isManageable: false,
      defaultWidth: 50,
      defaultPin: "right",
      hideColumnName: true,
    });
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
