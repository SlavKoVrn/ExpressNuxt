<script setup lang="ts">
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const table = useTemplateRef('table')
const UCheckbox = resolveComponent('UCheckbox')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

type Item = {
  id: number
  text: string
  order: number
}

// Reactive data and loading state
const data = ref<Item[]>([])
const loading = ref(false)
const totalRows = ref(0)
const search = ref('')
const currentPage = ref(1)

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
  currentPage.value = 1
  pagination.value.pageIndex = 0 // Reset to first page on search
  fetchData()
})

onMounted(() => {
  fetchData()
})


const getHeaderCheckboxState = (table: ReturnType<typeof useVueTable>) => {
  const currentPageRows = table.getRowModel().rows
  if (currentPageRows.length === 0) return false

  const allSelected = currentPageRows.every(
    row => rowSelection.value[row.original.id] === true
  )

  const someSelected = currentPageRows.some(
    row => rowSelection.value[row.original.id] === true
  )

  if (allSelected) return true
  if (someSelected) return 'indeterminate'
  return false
}

function getHeader(column: Column<Item>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start'
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }
        }
      ]
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
      })
  )
}

// Columns definition
const columns: TableColumn<Item>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const state = getHeaderCheckboxState(table)
      return h(UCheckbox, {
        modelValue: state,
        'onUpdate:modelValue': (value: boolean) => {
          const currentPageIds = table.getRowModel().rows.map(row => row.original.id)
          if (value === true) {
            // Select all on current page
            currentPageIds.forEach(id => {
              rowSelection.value[id] = true
            })
          } else {
            // Deselect all on current page
            currentPageIds.forEach(id => {
              delete rowSelection.value[id]
              // or set to false if you prefer:
              // rowSelection.value[id] = false
            })
          }
        },
        'aria-label': 'Select all'
      })
    },
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
    header: ({ column }) => getHeader(column, 'Id'),
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'text',
    header: ({ column }) => getHeader(column, 'Text'),
  },
  {
    accessorKey: 'order',
    header: ({ column }) => getHeader(column, 'Order'),
    cell: ({ row }) => `#${row.getValue('order')}`
  },
]

const sorting = ref([
  {
    id: 'id',
    desc: false
  }
])
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
        v-model:page="currentPage"
        :items-per-page="pagination.pageSize"
        :total="totalRows"
        @update:page="(p) => pagination.pageIndex = p - 1"
      />
    </div>

    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      v-model:sorting="sorting"
      :data="data"
      :columns="columns"
      :loading="loading"
      :pagination-row-count="totalRows"
      class="flex-1"
    />

    <div v-if="loading" class="text-center">Loading...</div>

    <div class="flex justify-center border-t border-default pt-4" v-if="totalRows > 0">
      <UPagination
        v-model:page="currentPage"
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
th:has([role=checkbox]) {
  width: 50px;
}
</style>
