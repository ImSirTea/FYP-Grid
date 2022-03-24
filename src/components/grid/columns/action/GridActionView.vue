<template>
  <v-menu>
    <template #activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    ACTIONS
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberView",
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
});
</script>
