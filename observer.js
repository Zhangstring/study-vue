function observer(data) {
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
  function defineReactive(data, key, value) {
    if (typeof value === 'object') observer(value)
    var dep = new Dep()
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: function() {
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        return value
      },
      set: function(newVal) {
        if (typeof value === 'object') observer(newVal)
        if (value !== newVal) {
          value = newVal
          dep.notify()
        }
      }
    })
  }
}
function Dep() {
  this.subs = []
}
Dep.prototype.addSub = function(sub) {
  this.subs.push(sub)
}
Dep.prototype.notify = function() {
  this.subs.forEach(sub => {
    sub.update()
  })
}
Dep.target = null
