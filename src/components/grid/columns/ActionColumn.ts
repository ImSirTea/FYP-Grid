import { Column, ColumnOptions } from "@/components/grid/columns/Column";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface ActionColumnOptions extends ColumnOptions {}

export class ActionColumn extends Column<Record<string, any>, any> {
  declare options: Partial<ActionColumnOptions>;
  renderer = undefined;
  filterOptions = undefined;
}
