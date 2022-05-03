<template>
  <v-container fluid class="grid-control-panel-container">
    <v-row justify="center" align="center" dense>
      <v-spacer />
      <v-col cols="12" md="4">
        <v-text-field
          :value="gridState.searchValue"
          :placeholder="$tc.search_for"
          append-icon="mdi-magnify"
          @input="updateSearchValue"
        />
      </v-col>
      <v-col cols="6" sm="auto">
        <v-btn outlined @click="toggleManageMenu" block>
          <v-icon class="mr-2">mdi-view-column</v-icon>
          {{ $tc.manage }}
        </v-btn>
      </v-col>
      <v-col cols="6" sm="auto">
        <v-btn outlined @click="toggleFilterMenu" block>
          <v-icon class="mr-2">mdi-filter-variant</v-icon>
          {{ $tc.filter }}
        </v-btn>
      </v-col>
      <v-col cols="6" sm="auto">
        <v-btn
          :disabled="!gridState.isDirty"
          outlined
          block
          @click="$emit('apply:item-changes')"
        >
          <v-icon class="mr-2">mdi-check</v-icon>
          {{ $tc.apply }}
        </v-btn>
      </v-col>
      <v-col cols="6" sm="auto">
        <v-btn
          :disabled="!gridState.isDirty"
          outlined
          block
          @click="$emit('reset:item-changes')"
        >
          <v-icon class="mr-2">mdi-trash-can</v-icon>
          {{ $tc.reset }}
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
import { GridState } from "@/components/grid/GridState";

/**
 * Parent component to all (mostly state) management functions
 */
export default defineComponent({
  name: "GridControlPanel",
  components: { FilterMenu, ManageMenu },
  setup(props, context) {
    const showFilterMenu = ref(false);
    const showManageMenu = ref(false);
    const gridState = inject<GridState>("gridState")!;

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
