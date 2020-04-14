import { TodoDaoBase as TodoBase } from '@/dao/base/TodoDaoBase'
import { TodolistDaoBase as TodolistBase } from '@/dao/base/TodolistDaoBase'
import { UserDaoBase as UserBase } from '@/dao/base/UserDaoBase'
import { TodoDao as TodoFB } from '@/dao/firebase/TodoDao'
import { TodolistDao as TodolistFB } from '@/dao/firebase/TodolistDao'
import { UserDao as UserFB } from '@/dao/firebase/UserDao'

const DB_MODE = process.env.DATABASE_MODE

export function CreateTodoDao () {
  return DB_MODE === 'local' ? new TodoBase() : new TodoFB()
}

export function CreateTodolistDao () {
  return DB_MODE === 'local' ? new TodolistBase() : new TodolistFB()
}

export function CreateUserDao () {
  return DB_MODE === 'local' ? new UserBase() : new UserFB()
}
