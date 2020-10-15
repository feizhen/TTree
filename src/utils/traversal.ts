import TreeNode, {
  NodeConfig,
  StatisticsInfo,
  TreeNodeType,
} from "../libs/TreeNode";

import { cloneDeep as _cloneDeep } from "lodash";
import EventEmitter from "../libs/EventEmitter";

export interface TraversalConfig {
  idKey: string;
  childKey: string;
}

/**
 * 遍历元素数据，使用TreeNode构造节点
 *
 * @param {*} originData 原始数据
 * @param {TraversalConfig} [config] 遍历设置
 * @return {tree, nodeMap, leafMap}
 */
export function traversal<T>(
  originData: any,
  config: TraversalConfig = { idKey: "id", childKey: "children" }
) {
  const data = _cloneDeep(originData);

  const nodeMap = new Map<string, TreeNode>();

  const leafMap = new Map<string, TreeNode>();

  let root = true;

  const tree = parseNode(data, config, 1);

  return {
    tree,
    nodeMap,
    leafMap,
  };

  function parseNode(
    node: any,
    config: TraversalConfig,
    level: number
  ): TreeNode {
    let type: TreeNodeType;
    const hasChild = node[config.childKey] && node[config.childKey].length > 0;
    let children = [];
    const statistics: StatisticsInfo = {
      all: hasChild ? 0 : 1,
      selected: 0,
    };
    const customData = node;

    // TODO: 添加一个eventBus，尝试和子节点建立通信信道
    const eventBus = new EventEmitter();

    // 判断节点类型：root | node | leaf
    if (root) {
      type = "root";
      root = false;
    } else if (hasChild) {
      type = "node";
    } else {
      type = "leaf";
    }

    // 递归处理子节点
    if (hasChild) {
      children = node[config.childKey].map((subNode: any) => {
        const childNode = parseNode(subNode, config, level + 1);
        if (childNode.isLeaf) {
          statistics.all += 1;
        } else {
          statistics.all += childNode.statistics.all;
        }
        return childNode;
      });
    }

    const nodeConfig: NodeConfig = {
      id: node[config.idKey], // 如果没有提供id，需要自己生成一个
      type,
      statistics,
      level,
    };

    // 将原始数据中的子节点数组删除，统一构建 treeNode 的 children
    delete customData[config.childKey];

    const treeNode = new TreeNode(customData, children, nodeConfig);

    if (treeNode.isLeaf) {
      leafMap.set(treeNode.id, treeNode);
    } else {
      nodeMap.set(treeNode.id, treeNode);
    }

    return treeNode;
  }
}
