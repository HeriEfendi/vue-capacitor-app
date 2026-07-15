<template>
  <input
    ref="inputRef"
    type="text"
    inputmode="numeric"
    :class="inputClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="displayValue"
    @beforeinput="onBeforeInput"
    @input="onInput"
    @focus="onFocus"
  />
</template>

<script>
import { ref, computed, nextTick } from 'vue'

export default {
  name: 'NumberInput',
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    placeholder: {
      type: String,
      default: '0'
    },
    inputClass: {
      type: String,
      default: 'form-control app-control'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const inputRef = ref(null)

    // Format number to ID locale (dots as thousand separators)
    const format = (num) => {
      if (num === null || num === undefined || num === '') return ''
      return new Intl.NumberFormat('id-ID').format(Number(num))
    }

    // Strip all non-digit chars to get raw integer string
    const stripFormatting = (str) => String(str).replace(/[^\d]/g, '')

    const displayValue = computed(() => format(props.modelValue))

    const onFocus = (e) => {
      // Place cursor at end on focus
      nextTick(() => {
        const len = e.target.value.length
        e.target.setSelectionRange(len, len)
      })
    }

    const onBeforeInput = (e) => {
      // Allow: digits, backspace/delete (handled by browser), and control keys
      if (e.data && !/^\d$/.test(e.data)) {
        e.preventDefault()
      }
    }

    const onInput = (e) => {
      const el = e.target
      // Remember cursor position relative to the END of the string
      // (more reliable than from start because formatting adds dots)
      const rawBefore = stripFormatting(el.value)
      const cursorFromEnd = el.value.length - el.selectionEnd

      // Parse raw digits and emit
      const rawNum = rawBefore === '' ? null : Number(rawBefore)
      emit('update:modelValue', rawNum)

      // Re-apply formatted value and restore cursor
      nextTick(() => {
        const formatted = format(rawNum)
        el.value = formatted
        // Restore cursor: count from end, but account for dot separators
        const newPos = Math.max(0, formatted.length - cursorFromEnd)
        el.setSelectionRange(newPos, newPos)
      })
    }

    return { inputRef, displayValue, onInput, onFocus, onBeforeInput }
  }
}
</script>
