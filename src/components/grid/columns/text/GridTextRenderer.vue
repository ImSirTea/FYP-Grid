<template>
  <span v-if="!isEditing">{{ value }}</span>
  <text-field
    v-else
    v-bind="$attrs"
    :value="value"
    class="pa-0 ma-0"
    dense
    hide-details
    @input="$emit('input', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import TextField from "@/components/controls/inputs/TextField.vue";

export default defineComponent({
  name: "GridTextRenderer",
  components: { TextField },
  props: {
    value: {
      type: String,
      required: false,
    },
    isEditing: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>
