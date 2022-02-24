<template>
  <v-container fluid pa-0>
    <v-row justify="center">
      <v-col
        :key="column.key + index"
        v-for="(filter, index) in relevantFilters"
        cols="12"
      >
        <filter-item :column="column" :filter="filter" :index="index" />
      </v-col>
      <v-col cols="auto" class="pt-0">
        <v-btn
          color="success"
          small
          icon
          depressed
          outlined
          @click="addNewFilter"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Column } from "@/components/grid/columns/Column";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  computed,
  inject,
} from "@vue/composition-api";
import $tc from "@/textConstants";
import FilterItem from "@/components/grid/filters/FilterItem.vue";

export default defineComponent({
  name: "FilterGroup",
  components: { FilterItem },
  props: {
    column: {
      type: Object as PropType<Column<any, any>>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;

    const relevantFilters = computed(
      () => gridState.filterOptions[props.column.key]
    );

    const addNewFilter = () => {
      gridState.addNewFilter(props.column);
    };

    return {
      test: gridState.filterOptions["idx"],
      test2: gridState.filterOptions,
      test3: props.column.key,
      gridState,
      addNewFilter,
      relevantFilters,
      $tc,
    };
  },
});
</script>
