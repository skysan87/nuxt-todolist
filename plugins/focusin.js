import Vue from 'vue'

Vue.directive('focusin', {
  inserted (el, binding) {
    const f = (evt) => {
      if (binding.value(evt, el)) {
        window.removeEventListener('focusin', f, false)
        console.log('evnet removed')
      }
    }
    window.addEventListener('focusin', f, false)
    console.log('evnet added')
  }
})
