
// 编写 massTree 组件
import massTree from './src/index.vue';

import TreeManager from './libs/treeManager';

/* istanbul ignore next */
massTree.install = function (Vue) {
  // ts 装饰器会把 name 放在options
  Vue.component('Rz' + massTree.options.name, massTree);
};

massTree.TreeManager = TreeManager;

export default massTree;
