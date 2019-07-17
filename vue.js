function Vue(options) {
  this.$options = options || {}
  var data = (this._data = this.$options.data)
  var self = this
  Object.keys(data).forEach(key => {
    self._proxyData(key)
  })
  observer(data)
  this.$compile = new Compile(options.el || document.body, this)
}
Vue.prototype = {
  _proxyData: function(key, setter, getter) {
    var me = this,
      setter =
        setter ||
        Object.defineProperty(me, key, {
          configurable: false,
          enumerable: true,
          get: function() {
            return me._data[key]
          },
          set: function(newVal) {
            me._data[key] = newVal
          }
        })
  }
}
