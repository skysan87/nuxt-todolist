/* eslint-disable */
import { Todolist } from '@/model/Todolist'

export class TodolistDaoBase {

  async getLists(userId) {
    const lists = []
    const list = new Todolist('defaultId', { title: 'dummy' })
    lists.push(list)
    for (let index = 0; index < 5; index++) {
      const list = new Todolist(`list_id${index}`, { title: `dummy${index}` })
      lists.push(list)
    }
    return lists
  }

  async add(params, orderIndex, userId) {
    const list = new Todolist('', params)
    list.id = Date.now().toString()
    list.orderIndex = orderIndex
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
