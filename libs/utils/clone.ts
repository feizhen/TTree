import { isArray, isObject, isDate } from "./shared";
import TreeNode from "../treeNode";

/**
 * 对一个TreeNode节点进行深拷贝
 * 我们不需要该节点的Children数据，所以剔除children属性可以加快拷贝速度
 * @param origin
 */

const cloneDeep = (origin: TreeNode) => {
  const parents: any = [];
  const children: any = [];
  // 处理本对象上的属性值
  // 处理原型方法
  const _clone = (parent: any) => {
    if (parent === null) return null;

    // 非引用对象直接返回
    if (!isObject(parent)) return parent;

    let child, proto;

    if (isArray(parent)) {
      child = [];
    } else {
      proto = Object.getPrototypeOf(parent);

      child = Object.create(proto);
    }

    const index = parents.indexOf(parent);

    if (index !== -1) {
      return children[index];
    }

    parents.push(parent);

    children.push(child);

    for (let i in parent) {
      // 我们不需要children数据
      if (parent.hasOwnProperty(i) && i !== "children") {
        child[i] = _clone(parent[i]);
      }
    }

    return child;
  };

  return _clone(origin);
};

export const cloneNode = (val: TreeNode | TreeNode[]) => {
  if (isArray(val)) return val.map(v => cloneDeep(v));

  return cloneDeep(val);
};
