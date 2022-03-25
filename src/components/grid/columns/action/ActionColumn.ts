import {
  Column,
  ColumnOptions,
  GridWidthEnum,
  ValueExtractor,
} from "@/components/grid/columns/Column";
import GridActionView from "@/components/grid/columns/action/GridActionView.vue";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface ActionColumnOptions extends ColumnOptions {}

export interface ActionDefinition {
  action: (...args: any) => void;
  text: string;
}

export class ActionColumn extends Column<
  Record<string, any>,
  any,
  ActionColumnOptions
> {
  declare options: Partial<ActionColumnOptions>;
  viewRenderer = GridActionView;
  editRenderer = undefined;
  filterOptions = undefined;
  actions: ActionDefinition[] = [];

  constructor(key: string, itemValue: ValueExtractor<any, any>) {
    super(key, itemValue);

    this.setOption("isFilterable", false);
    this.setOption("isSortable", false);
    this.setOption("defaultWidth", GridWidthEnum.SMALL);
  }

  addAction(
    text: ActionDefinition["text"],
    action: ActionDefinition["action"]
  ) {
    this.actions.push({ action, text });

    return this;
  }
}
