<script setup lang="ts" generic="T extends Record<string, unknown>">
interface Column<TData> {
  key: keyof TData | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  rowKey?: keyof T | ((row: T) => string | number)
  emptyText?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  rowKey: 'id' as keyof T,
  emptyText: 'No data available',
  emptyIcon: 'i-lucide-inbox'
})

const emit = defineEmits<{
  rowClick: [row: T]
  select: [rows: T[]]
  sort: [key: string, direction: 'asc' | 'desc']
}>()

defineSlots<{
  [key: string]: (props: { row: T; value: unknown }) => unknown
  'header-actions'?: () => unknown
  'row-actions'?: (props: { row: T }) => unknown
  empty?: () => unknown
}>()

const selectedRows = ref<T[]>([]) as Ref<T[]>
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

function getRowKey(row: T): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] as string | number
}

function getValue(row: T, key: string): unknown {
  return key.split('.').reduce((obj: unknown, k) => {
    if (obj && typeof obj === 'object') {
      return (obj as Record<string, unknown>)[k]
    }
    return undefined
  }, row)
}

function isSelected(row: T): boolean {
  const key = getRowKey(row)
  return selectedRows.value.some(r => getRowKey(r) === key)
}

function toggleRow(row: T) {
  const key = getRowKey(row)
  const index = selectedRows.value.findIndex(r => getRowKey(r) === key)

  if (index === -1) {
    selectedRows.value.push(row)
  }
  else {
    selectedRows.value.splice(index, 1)
  }

  emit('select', selectedRows.value)
}

function toggleAll() {
  if (selectedRows.value.length === props.data.length) {
    selectedRows.value = []
  }
  else {
    selectedRows.value = [...props.data]
  }

  emit('select', selectedRows.value)
}

function handleSort(column: Column<T>) {
  if (!column.sortable) return

  const key = column.key as string

  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  emit('sort', key, sortDirection.value)
}

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th
              v-if="selectable"
              class="w-12 px-4 py-3"
            >
              <UCheckbox
                :model-value="selectedRows.length === data.length && data.length > 0"
                :indeterminate="selectedRows.length > 0 && selectedRows.length < data.length"
                @update:model-value="toggleAll"
              />
            </th>

            <th
              v-for="column in columns"
              :key="String(column.key)"
              :class="[
                'px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white',
                alignmentClasses[column.align || 'left'],
                column.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800' : ''
              ]"
              :style="column.width ? { width: column.width } : undefined"
              @click="handleSort(column)"
            >
              <div class="flex items-center gap-1">
                <span>{{ column.label }}</span>
                <UIcon
                  v-if="column.sortable && sortKey === column.key"
                  :name="sortDirection === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="h-4 w-4"
                />
              </div>
            </th>

            <th
              v-if="$slots['row-actions'] || $slots['header-actions']"
              class="w-12 px-4 py-3"
            >
              <slot name="header-actions" />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          <tr v-if="loading">
            <td
              :colspan="columns.length + (selectable ? 1 : 0) + ($slots['row-actions'] ? 1 : 0)"
              class="px-4 py-8 text-center"
            >
              <LoadingState />
            </td>
          </tr>

          <tr v-else-if="data.length === 0">
            <td
              :colspan="columns.length + (selectable ? 1 : 0) + ($slots['row-actions'] ? 1 : 0)"
              class="px-4 py-8"
            >
              <slot name="empty">
                <EmptyState
                  :icon="emptyIcon"
                  :title="emptyText"
                />
              </slot>
            </td>
          </tr>

          <tr
            v-for="row in data"
            v-else
            :key="getRowKey(row)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
            @click="$emit('rowClick', row)"
          >
            <td
              v-if="selectable"
              class="w-12 px-4 py-4"
              @click.stop
            >
              <UCheckbox
                :model-value="isSelected(row)"
                @update:model-value="toggleRow(row)"
              />
            </td>

            <td
              v-for="column in columns"
              :key="String(column.key)"
              :class="[
                'px-4 py-4 text-sm',
                alignmentClasses[column.align || 'left']
              ]"
            >
              <slot
                :name="String(column.key)"
                :row="row"
                :value="getValue(row, String(column.key))"
              >
                {{ getValue(row, String(column.key)) ?? '-' }}
              </slot>
            </td>

            <td
              v-if="$slots['row-actions']"
              class="w-12 px-4 py-4"
              @click.stop
            >
              <slot
                name="row-actions"
                :row="row"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
