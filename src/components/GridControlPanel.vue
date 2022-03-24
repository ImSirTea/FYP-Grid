<template>
  <v-container fluid class="grid-control-panel-container">
    <v-row align="center">
      <v-spacer />
      <v-col cols="8" sm="6" md="4">
        <v-text-field
          :value="gridState.searchValue"
          :placeholder="$tc.search_for"
          append-icon="mdi-magnify"
          @input="updateSearchValue"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn outlined @click="toggleFilterMenu">
          <v-icon class="mr-2">mdi-filter-variant</v-icon>
          {{ $tc.filter }}
        </v-btn>
      </v-col>
    </v-row>
    <filter-menu v-show="showFilterMenu" v-model="showFilterMenu" />
  </v-container>
</template>

<script lang="ts">
import FilterMenu from "@/components/grid/filters/FilterMenu.vue";
import { GridState } from "@/components/grid/GridState";
import { defineComponent, ref, inject } from "@vue/composition-api";
import $tc from "@/textConstants";
import { debounce } from "lodash";

/**
 * Parent component to all (mostly state) management functions
 */
export default defineComponent({
  name: "GridControlPanel",
  components: { FilterMenu },
  setup(props) {
    const showFilterMenu = ref(false);
    const gridState = inject<GridState>("gridState")!;

    const updateSearchValue = debounce((newValue: string) => {
      gridState.setSearchValue(newValue);
    }, 250);

    const toggleFilterMenu = () => {
      showFilterMenu.value = !showFilterMenu.value;
    };

    return {
      gridState,
      updateSearchValue,
      toggleFilterMenu,
      showFilterMenu,
      $tc,
    };
  },
});
</script>
