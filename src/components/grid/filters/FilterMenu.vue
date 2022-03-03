<template>
  <v-navigation-drawer
    :value="value"
    :right="true"
    :absolute="true"
    :temporary="true"
    :hide-overlay="true"
    @input="toggleMenu"
  >
    <!-- Prepend our header row -->
    <template #prepend>
      <v-list-item>
        <v-list-item-title>
          {{ $tc.filter }}
        </v-list-item-title>
        <v-btn icon @click="toggleMenu(!value)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-list-item>
    </template>
    <v-divider />

    <!-- Build all of our filter controls -->
    <v-expansion-panels accordion flat multiple>
      <v-expansion-panel
        v-for="column in gridConfiguration.columns"
        :key="column.key"
      >
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
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import FilterGroup from "@/components/grid/filters/FilterGroup.vue";
import { GridState } from "@/components/grid/GridState";
import { Column } from "@/components/grid/columns/Column";

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
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;

    return {
      gridConfiguration,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      numberOfFiltersForColumn: (column: Column<any, any>) =>
        gridState.filterOptions[column.key]?.length ?? 0,
      $tc,
    };
  },
});
</script>
