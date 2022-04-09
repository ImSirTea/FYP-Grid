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
            {{ $tc.manage_columns }}
          </v-list-item-title>
          <v-btn icon @click="toggleMenu(!value)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item>
      </v-list>
    </template>
    <v-divider />

    <v-expansion-panels accordian flat>
      <v-expansion-panel v-for="column in manageableColumns" :key="column.key">
        <v-expansion-panel-header
          @dragstart="(event) => dragStart(event, column)"
          @dragover="(event) => dragOver(event, column)"
          @dragend="dragEnd"
          draggable
        >
          <v-container class="pa-0" fluid>
            <v-row align="center" no-gutters>
              <v-col cols="auto">
                {{ column.key }}
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <manage-group :column="column" />
        </v-expansion-panel-content>
        <v-divider />
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, inject, computed } from "@vue/composition-api";
import $tc from "@/textConstants";
import ManageGroup from "@/components/grid/manage/ManageGroup.vue";
import { GridManager } from "@/components/grid/GridManager";
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { useColumnDragManager } from "@/components/grid/events/ColumnDragManager";
import { GridState } from "@/components/grid/GridState";

export default defineComponent({
  name: "ManageMenu",
  components: { ManageGroup },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, context) {
    const gridManager = inject<GridManager>("gridManager")!;
    const gridState = inject<GridState>("gridState")!;
    const { dragStart, dragOver, dragEnd } = useColumnDragManager(
      gridState,
      "vertical"
    );

    const manageableColumns = computed<AnyGridColumn[]>(() =>
      Array.from(Object.values(gridManager.columns).flatMap((column) => column))
    );

    return {
      dragStart,
      dragOver,
      dragEnd,
      manageableColumns,
      cols: gridManager.columns,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      $tc,
    };
  },
});
</script>
