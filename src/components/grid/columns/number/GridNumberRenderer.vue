<template>
  <span v-if="!isEditing">{{ value }}</span>
  <number-field
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
import NumberField from "@/components/controls/inputs/NumberField.vue";

export default defineComponent({
  name: "GridNumberRenderer",
  components: { NumberField },
  inheritAttrs: false,
  props: {
    value: {
      type: Number,
      required: false,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
