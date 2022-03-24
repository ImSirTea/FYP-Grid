import { Column, ColumnOptions } from "@/components/grid/columns/Column";
import GridActionView from "@/components/grid/columns/action/GridActionView.vue";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface ActionColumnOptions extends ColumnOptions {}

export class ActionColumn extends Column<Record<string, any>, any> {
  declare options: Partial<ActionColumnOptions>;
  viewRenderer = GridActionView;
  editRenderer = undefined;
  filterOptions = undefined;
}
