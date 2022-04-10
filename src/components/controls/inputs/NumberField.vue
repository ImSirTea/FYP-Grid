<template>
  <text-field
    v-bind="$attrs"
    :value="internalValue"
    :min="min"
    :max="max"
    type="number"
    @input="updateValue"
  />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { defineComponent, ref } from "@vue/composition-api";

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
      default: () => undefined,
    },
    min: {
      type: Number,
      required: false,
      default: () => undefined,
    },
    max: {
      type: Number,
      required: false,
      default: () => undefined,
    },
  },
  setup(props, context) {
    const internalValue = ref(props.value?.toString());

    const updateValue = (newValue: string) => {
      context.emit("input", Number(newValue));
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
