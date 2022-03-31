<template>
  <div>
    <v-menu v-model="isMenuVisible" offset-x>
      <template #activator="{}">
        <v-btn icon @click="toggleMenu">
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
  </div>
</template>

<script lang="ts">
import { ActionColumn } from "@/components/grid/columns/action/ActionColumn";
import { defineComponent, PropType, ref } from "@vue/composition-api";

export default defineComponent({
  name: "GridActionView",
  inheritAttrs: false,
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
    const isMenuVisible = ref(false);
    return {
      actions: props.column.actions,
      isMenuVisible,

      // Manually handle toggling as row-actions/routes were being forcibly added
      toggleMenu: (event: PointerEvent) => {
        isMenuVisible.value = !isMenuVisible.value;
        event.preventDefault();
      },
    };
  },
});
</script>
