import { Column, ColumnOptions } from "@/components/grid/columns/Column";
import { VIcon } from "vuetify/lib";

/**
 * Optional and column specific properties to configure NumberColumn behaviours
 */
export interface IconColumnOptions extends ColumnOptions {}

export class IconColumn extends Column<any, any> {
  declare options: Partial<IconColumnOptions>;
  component = VIcon;
  filterOptions = undefined; //TODO
}
