<template>
  <text-field v-model="internalValue" />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { defineComponent, computed, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextEdit",
  components: { TextField },
  model: {
    event: "input",
    prop: "value",
  },
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<TextColumn<any>>,
      required: true,
    },
    value: {
      type: String,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = computed({
      get: () => props.value,
      set: (value) => context.emit("input", value),
    });

    const updateValue = (value) => {
      context.emit("input", value);
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
