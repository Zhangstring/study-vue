function Compile(el, vm) {
  this.$vm = vm
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  if (this.$el) {
    // 创建虚拟dom片段
    this.$fragment = this.node2Fragment(this.$el)
    // 初始化虚拟om片段
    this.init()
    // 将虚拟dom片段加入dom中
    this.$el.appendChild(this.$fragment)
  }
}
Compile.prototype.node2Fragment = function(el) {
  var fragment = document.createDocumentFragment()
  var child
  while ((child = el.firstChild)) {
    fragment.appendChild(child)
  }
  return fragment
}
Compile.prototype.init = function() {
  this.compileElement(this.$fragment)
}
Compile.prototype.compileElement = function(el) {
  var childNodes = el.childNodes
  Array.prototype.slice.call(childNodes).forEach(childNode => {
    var text = childNode.textContent
    var reg = /\{\{(.*)\}\}/
    if (this.isElementNode(childNode)) {
      this.compile(childNode)
    } else if (this.isTextNode(childNode) && reg.test(text)) {
      this.compileText(childNode, RegExp.$1.trim())
    }
    if (childNode.childNodes && childNode.childNodes.length) {
      this.compileElement(childNode)
    }
  })
}
Compile.prototype.compile = function(node) {
  var attrs = node.attributes
  Array.prototype.slice.call(attrs).forEach(attr => {
    var attrName = attr.name
    if (this.isDirective(attrName)) {
      var exp = attr.value
      var dir = attrName.substring(2)
      if (this.isEventDirective(dir)) {
        compileUtil.eventHandler(node, this.$vm, exp, dir)
      } else {
        compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
      }
    }
    node.removeAttribute(attrName)
  })
}
Compile.prototype.compileText = function(node, exp) {
  compileUtil.text(node, this.$vm, exp)
}
// 判断是否元素节点
Compile.prototype.isElementNode = function(node) {
  return node.nodeType === 1
}
// 判断是否文本节点
Compile.prototype.isTextNode = function(node) {
  return node.nodeType === 3
}
// 判断是否为v-指令
Compile.prototype.isDirective = function(name) {
  return name.indexOf('v-') === 0
}
// 判断是否为事件指令
Compile.prototype.isEventDirective = function(dir) {
  return dir.indexOf('on') === 0
}
var compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  class: function(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },
  html: function(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model: function(node, vm, exp) {
    this.bind(node, vm, exp, 'model')
    var val = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      var newVal = e.target.value
      if (val === newVal) return
      this._setVMVal(vm, exp, newVal)
      val = newVal
    })
  },
  bind: function(node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater']
    updaterFn && updaterFn(node, this._getVMVal(vm, exp))
    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },
  eventHandler: function(node, vm, exp, dir) {
    var eventType = dir.split(':')[1]
    var fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  _getVMVal: function(vm, exp) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(k => {
      val = val[k]
    })
    return val
  },
  _setVMVal: function(vm, exp, newVal) {
    var val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = newVal
      }
    })
  }
}
var updater = {
  textUpdater: function(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  htmlUpdater: function(node, value) {
    node.innerHtml = typeof value === 'undefined' ? '' : value
  },
  classUpdater: function(node, value, oldValue) {
    var className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')
    var space = className && String(value) ? ' ' : ''
    node.className = className + space + value
  },
  modelUpdater: function(node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  }
}
