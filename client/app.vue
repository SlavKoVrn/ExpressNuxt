<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const table = useTemplateRef('table')
const UCheckbox = resolveComponent('UCheckbox')

type Item = {
  id: number
  text: string
}

// Reactive data and loading state
const data = ref<Item[]>([])
const loading = ref(false)
const totalRows = ref(0)
const search = ref('')

// Pagination state
const pagination = ref({
  pageIndex: 0,
  pageSize: 20
})

const rowSelection = ref([])

// Fetch data from server
const fetchData = async () => {
  loading.value = true
  const page = pagination.value.pageIndex + 1 // Server uses 1-based index
  const perPage = pagination.value.pageSize

  try {
    const response = await $fetch('http://localhost:4000/items', {
      params: {
        search: search.value,
        page,
        'per-page': perPage
      }
    })

    data.value = response.items || []
    totalRows.value = response.total || 0
  } catch (error) {
    console.error('Error fetching data:', error)
    data.value = []
  } finally {
    loading.value = false
  }
}

// Watch for pagination or search changes and fetch new data
watch(() => pagination.value, fetchData, { deep: true })
watch(() => search.value, () => {
  pagination.value.pageIndex = 0 // Reset to first page on search
  fetchData()
})

onMounted(() => {
  fetchData()
})

// Columns definition
const columns: TableColumn<Item>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: rowSelection.value[row.getValue('id')],
        'onUpdate:modelValue': (value: boolean) => {
          rowSelection.value[row.getValue('id')] = value
        },
        'aria-label': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'text',
    header: 'Text'
  },
]
</script>

<template>
<div class="container py-5">
  <div class="w-full space-y-4 pb-4">

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="row">
        <div class="col-sm-6">
            <!-- Search Input -->
            <label for="search" class="mr-2 col-form-label-sm">Search:&nbsp;</label>
            <UInput
              v-model="search"
              name="search"
              placeholder="Search..."
              class="max-w-md"
            />
        </div>
        <div class="col-sm-6">
            <div v-if="totalRows === 0">
              No records found.
            </div>
            <div v-else>
              Records from
              <strong>{{ pagination.pageIndex * pagination.pageSize + 1 }}</strong>
              to
              <strong>
                {{ Math.min(pagination.pageIndex * pagination.pageSize + pagination.pageSize, totalRows) }}
              </strong>
              of
              <strong>{{ totalRows }}</strong>
              total records.
            </div>
        </div>
    </div>

    <div class="flex justify-center border-t border-default pt-4" v-if="totalRows > 0">
      <UPagination
        :default-page="(pagination.pageIndex || 0) + 1"
        :items-per-page="pagination.pageSize"
        :total="totalRows"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />
    </div>

    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      :data="data"
      :columns="columns"
      :loading="loading"
      :pagination-row-count="totalRows"
      class="flex-1"
    />

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="flex justify-center border-t border-default pt-4" v-if="totalRows > 0">
      <UPagination
        :default-page="(pagination.pageIndex || 0) + 1"
        :items-per-page="pagination.pageSize"
        :total="totalRows"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />
    </div>
  </div>
</div>
</template>

<style>
@import "tailwindcss";
@import "@nuxt/ui"; 
.max-w-md {width:85%;}
</style>
