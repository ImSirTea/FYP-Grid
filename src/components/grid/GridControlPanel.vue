<template>
  <v-container fluid class="grid-control-panel-container">
    <v-row align="center" dense>
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
        <v-btn outlined @click="toggleManageMenu">
          <v-icon class="mr-2">mdi-view-column</v-icon>
          {{ $tc.manage }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn outlined @click="toggleFilterMenu">
          <v-icon class="mr-2">mdi-filter-variant</v-icon>
          {{ $tc.filter }}
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn outlined @click="context.emit('update:items')">
          <v-icon class="mr-2">mdi-content-save</v-icon>
          {{ $tc.save }}
        </v-btn>
      </v-col>
    </v-row>
    <filter-menu v-show="showFilterMenu" v-model="showFilterMenu" />
    <manage-menu v-show="showManageMenu" v-model="showManageMenu" />
  </v-container>
</template>

<script lang="ts">
import FilterMenu from "@/components/grid/filters/FilterMenu.vue";
import ManageMenu from "@/components/grid/manage/ManageMenu.vue";
import { defineComponent, ref, inject } from "@vue/composition-api";
import $tc from "@/textConstants";
import { debounce } from "lodash";
import { GridManager } from "@/components/grid/GridManager";

/**
 * Parent component to all (mostly state) management functions
 */
export default defineComponent({
  name: "GridControlPanel",
  components: { FilterMenu, ManageMenu },
  setup(props, context) {
    const showFilterMenu = ref(false);
    const showManageMenu = ref(false);
    const { gridState } = inject<GridManager>("gridManager")!;

    const updateSearchValue = debounce((newValue: string) => {
      gridState.setSearchValue(newValue);
    }, 250);

    const toggleFilterMenu = () => {
      showFilterMenu.value = !showFilterMenu.value;
    };

    const toggleManageMenu = () => {
      showManageMenu.value = !showManageMenu.value;
    };

    return {
      gridState,
      updateSearchValue,
      toggleFilterMenu,
      toggleManageMenu,
      showFilterMenu,
      showManageMenu,
      $tc,
    };
  },
});
</script>
