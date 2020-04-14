/* eslint-disable */
import { Todolist } from '@/model/Todolist'

export class TodolistDaoBase {

  async getLists(userId) {
    const list = new Todolist('defaultId', { title: 'dummy' })
    return [ list ]
  }

  async add(title, orderIndex, userId) {
    const list = new Todolist('', {})
    list.id = Date.now().toString()
    list.orderIndex = orderIndex
    list.title = title
    list.userId = userId

    return {
      isSuccess: true,
      value: list
    }
  }

  async update(list) {
    return true
  }

  async delete(id) {
    return true
  }
}
