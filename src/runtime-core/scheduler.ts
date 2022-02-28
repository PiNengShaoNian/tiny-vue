const queue: Function[] = []
let isFlushPending = false
const p = Promise.resolve()

const flushJobs = () => {
  if (!isFlushPending) {
    isFlushPending = true
    queueMicrotask(() => {
      while (queue.length) {
        const job = queue.shift()!
        job()
      }

      isFlushPending = false
    })
  }
}

export const queueJobs = (fn: Function) => {
  if (!queue.includes(fn)) {
    queue.push(fn)
  }

  flushJobs()
}

export const nextTick = (fn?: () => void) => {
  return fn ? p.then(fn) : p
}
