<template>
  <text-field
    v-bind="$attrs"
    v-model="internalValue"
    :min="min"
    :max="max"
    type="number"
  />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  name: "NumberField",
  components: { TextField },
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    value: {
      type: Number,
      required: false,
    },
    min: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = computed({
      get: () => props.value?.toString() ?? "",
      set: (newValue) => context.emit("input", Number(newValue)),
    });

    return {
      internalValue,
    };
  },
});
</script>
