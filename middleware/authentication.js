export default function ({ store, redirect, route }) {
  if (!store.getters['user/isLogin'] && route.name !== 'login') {
    redirect('/login')
  }
  if (store.getters['user/isLogin'] && route.name === 'login') {
    redirect('/todolist')
  }
}
