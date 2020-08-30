import { TodoDao } from '@/dao/indexeddb/TodoDao'
import { TodolistDao } from '@/dao/indexeddb/TodolistDao'
import { HabitDao } from '@/dao/indexeddb/HabitDao'

export function CreateTodoDao () {
  return new TodoDao()
}

export function CreateTodolistDao () {
  return new TodolistDao()
}

export function CreateHabitDao () {
  return new HabitDao()
}
