import { TodoDaoBase as TodoBase } from '@/dao/base/TodoDaoBase'
import { TodolistDaoBase as TodolistBase } from '@/dao/base/TodolistDaoBase'
import { HabitDaoBase as HabitBase } from '@/dao/base/HabitDaoBase'

export function CreateTodoDao () {
  return new TodoBase()
}

export function CreateTodolistDao () {
  return new TodolistBase()
}

export function CreateHabitDao () {
  return new HabitBase()
}
