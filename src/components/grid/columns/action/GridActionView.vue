<template>
  <v-menu offset-x>
    <template #activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group>
        <v-list-item v-for="action in actions" :key="action.text">
          <router-link v-if="action.to" :to="action.to(item)">
            {{ action.text }}
          </router-link>
          <v-list-item-content v-else @click="action.onClick(item)">
            <v-list-item-title>
              {{ action.text }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridActionView",
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<ActionColumn<any>>,
      required: true,
    },
  },
  setup(props) {
    return {
      actions: props.column.actions,
    };
  },
});
</script>
