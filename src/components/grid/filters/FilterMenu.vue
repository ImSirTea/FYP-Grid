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
          {{ column.key }}
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

    return {
      gridConfiguration,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      $tc,
    };
  },
});
</script>
