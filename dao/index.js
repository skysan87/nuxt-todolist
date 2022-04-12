import * as base from '@/dao/base'
import * as fb from '@/dao/firebase'

const FB_MODE = process.env.DATABASE_MODE !== 'local'
const GOOGLE_AUTH_MODE = process.env.GOOGLE_AUTH === '1'

export function CreateTodoDao () {
  return FB_MODE ? new fb.TodoDao() : new base.TodoDaoBase()
}

export function CreateTodolistDao () {
  return FB_MODE ? new fb.TodolistDao() : new base.TodolistDaoBase()
}

export function CreateUserDao () {
  return GOOGLE_AUTH_MODE ? new fb.UserDao() : new base.UserDaoBase()
}

export function CreateHabitDao () {
  return FB_MODE ? new fb.HabitDao() : new base.HabitDaoBase()
}

export function CreateConfigDao () {
  return FB_MODE ? new fb.ConfigDao() : new base.ConfigDaoBase()
}
