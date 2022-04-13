<template>
  <v-navigation-drawer
    :value="value"
    right
    absolute
    temporary
    hide-overlay
    @input="toggleMenu"
  >
    <!-- Prepend our header row -->
    <template #prepend>
      <v-list>
        <v-list-item>
          <v-list-item-title>
            {{ $tc.filter }}
          </v-list-item-title>
          <v-btn icon @click="toggleMenu(!value)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item>
      </v-list>
    </template>
    <v-divider />

    <!-- Build all of our filter controls -->
    <v-expansion-panels accordion flat multiple>
      <v-expansion-panel v-for="column in filterableColumns" :key="column.key">
        <v-expansion-panel-header>
          <v-container class="pa-0" fluid>
            <v-row align="center" no-gutters>
              <v-col cols="auto">
                {{ column.key }}
              </v-col>
              <v-col class="pl-2" cols="auto">
                <v-chip small pill v-if="numberOfFiltersForColumn(column)">
                  {{ numberOfFiltersForColumn(column) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <filter-group :column="column" />
        </v-expansion-panel-content>
        <v-divider />
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, inject } from "@vue/composition-api";
import $tc from "@/textConstants";
import FilterGroup from "@/components/grid/filters/FilterGroup.vue";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";

export default defineComponent({
  name: "FilterMenu",
  components: {
    FilterGroup,
  },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, context) {
    const { gridState, gridConfiguration, filterableColumns } =
      inject<GridManager>("gridManager")!;

    return {
      gridConfiguration,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      numberOfFiltersForColumn: (column: AnyGridColumn) =>
        gridState.columnStates[column.key].filterOptions.length ?? 0,
      filterableColumns,
      $tc,
    };
  },
});
</script>
