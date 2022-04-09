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
          :col-key="column.key"
          @dragstart="(event) => dragStart(event, column)"
          @drag="drag"
          @dragend="dragEnd"
          @touchstart="(event) => dragStart(event, column)"
          @touchmove="drag"
          @touchend="dragEnd"
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
    const { gridState, gridConfiguration, sortedColumns } =
      inject<GridManager>("gridManager")!;
    const { dragStart, drag, dragEnd } = useColumnDragManager(
      gridState,
      gridConfiguration,
      "vertical"
    );

    const manageableColumns = computed<AnyGridColumn[]>(() => sortedColumns);

    return {
      dragStart,
      drag,
      dragEnd,
      manageableColumns,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      $tc,
    };
  },
});
</script>
