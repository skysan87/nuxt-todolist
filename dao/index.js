import { TodoDaoBase as TodoBase } from '@/dao/base/TodoDaoBase'
import { TodolistDaoBase as TodolistBase } from '@/dao/base/TodolistDaoBase'
import { UserDaoBase as UserBase } from '@/dao/base/UserDaoBase'
import { HabitDaoBase as HabitBase } from '@/dao/base/HabitDaoBase'
import { ConfigDaoBase as ConfigBase } from '@/dao/base/ConfigDaoBase'
import { TodoDao as TodoFB } from '@/dao/firebase/TodoDao'
import { TodolistDao as TodolistFB } from '@/dao/firebase/TodolistDao'
import { UserDao as UserFB } from '@/dao/firebase/UserDao'
import { HabitDao as HabitFB } from '@/dao/firebase/HabitDao'
import { ConfigDao as ConfigFB } from '@/dao/firebase/ConfigDao'

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

export function CreateHabitDao () {
  return DB_MODE === 'local' ? new HabitBase() : new HabitFB()
}

export function CreateConfigDao () {
  return DB_MODE === 'local' ? new ConfigBase() : new ConfigFB()
}
