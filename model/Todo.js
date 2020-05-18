import { TaskState } from '@/util/TaskState'

export class Todo {
  constructor (id, params) {
    this.id = id
    this.title = params.title || null
    this.state = params.state || TaskState.Todo.value
    this.detail = params.detail || null
    this.startdate = params.startdate || null
    this.enddate = params.enddate || null
    this.orderIndex = params.orderIndex || 0
    this.listId = params.listId || ''
    this.userId = params.userId || ''
    this.createdAt = params.createdAt || null
    this.updatedAt = params.updatedAt || null
  }

  get isDone () {
    return this.state === TaskState.Done.value
  }

  getData () {
    const params = {
      title: this.title,
      state: this.state,
      detail: this.detail,
      isDone: this.isDone,
      startdate: this.startdate,
      enddate: this.enddate,
      orderIndex: this.orderIndex,
      listId: this.listId,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
    return params
  }
}
