interface PaginationOptions {
  page?: number
  perPage?: number
  total?: number
}

interface PaginationReturn {
  page: Ref<number>
  perPage: Ref<number>
  total: Ref<number>
  lastPage: ComputedRef<number>
  hasNextPage: ComputedRef<boolean>
  hasPrevPage: ComputedRef<boolean>
  from: ComputedRef<number>
  to: ComputedRef<number>
  pageNumbers: ComputedRef<(number | string)[]>
  nextPage: () => void
  prevPage: () => void
  goToPage: (pageNumber: number) => void
  setTotal: (newTotal: number) => void
  reset: () => void
}

export function usePagination(options: PaginationOptions = {}): PaginationReturn {
  const page = ref(options.page || 1)
  const perPage = ref(options.perPage || 10)
  const total = ref(options.total || 0)

  const lastPage = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

  const hasNextPage = computed(() => page.value < lastPage.value)
  const hasPrevPage = computed(() => page.value > 1)

  const from = computed(() => {
    if (total.value === 0) return 0
    return (page.value - 1) * perPage.value + 1
  })

  const to = computed(() => {
    return Math.min(page.value * perPage.value, total.value)
  })

  const pageNumbers = computed(() => {
    const pages: (number | string)[] = []
    const totalPages = lastPage.value
    const currentPage = page.value
    const delta = 2

    const left = currentPage - delta
    const right = currentPage + delta + 1
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        }
        else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  })

  function nextPage(): void {
    if (hasNextPage.value) {
      page.value++
    }
  }

  function prevPage(): void {
    if (hasPrevPage.value) {
      page.value--
    }
  }

  function goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= lastPage.value) {
      page.value = pageNumber
    }
  }

  function setTotal(newTotal: number): void {
    total.value = newTotal
    if (page.value > lastPage.value) {
      page.value = lastPage.value
    }
  }

  function reset(): void {
    page.value = 1
  }

  return {
    page,
    perPage,
    total,
    lastPage,
    hasNextPage,
    hasPrevPage,
    from,
    to,
    pageNumbers,
    nextPage,
    prevPage,
    goToPage,
    setTotal,
    reset
  }
}
