const todo = {
  name: 'todo',
  version: 1,
  indexes: [
    { name: 'listId', key: 'listId', option: { unique: false, multiEntry: false } },
    // 今日の予定の検索インデックス
    { name: 'todays_todo', key: ['type', 'state', 'startdate'], option: { unique: false, multiEntry: false } },
    // 当日完了したタスクの検索インデックス
    { name: 'done_todo', key: ['type', 'state', 'stateChangeDate'], option: { unique: false, multiEntry: false } }
  ]
}

const todolist = {
  name: 'todolist',
  version: 1,
  indexes: [
    { name: 'activelist', key: 'deleteFlag', option: { unique: false, multiEntry: false } }
  ]
}

const habit = {
  name: 'habit',
  version: 1,
  indexes: []
}

const habitlist = {
  name: 'habitlist',
  version: 1,
  indexes: []
}
export default [todo, todolist, habit, habitlist]
