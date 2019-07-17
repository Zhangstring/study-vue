function Watcher(obj, key, cb) {
  Dep.target = this
  this.obj = obj
  this.key = key
  this.cb = cb
  this.value = obj[key]
  Dep.target = null
}
Watcher.prototype.update = function() {
  this.value = this.obj[this.key]
  this.cb(this.value)
}
