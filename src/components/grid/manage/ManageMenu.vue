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
        <v-expansion-panel-header>
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
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridState } from "@/components/grid/GridState";
import ManageGroup from "@/components/grid/manage/ManageGroup.vue";

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
    const gridConfiguration =
      inject<GridConfiguration<Record<string, any>>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;

    const manageableColumns = computed(() => gridConfiguration.columns);

    return {
      manageableColumns,
      toggleMenu: (isVisible) => context.emit("input", isVisible),
      $tc,
    };
  },
});
</script>
