import isArray from "lodash/isArray";
import has from "lodash/has";
import cloneDeep from "lodash/cloneDeep";
import { KeyConfig, NodeConfig, Statistics, SerialConfig } from "../types";
import TreeNode from "../treeNode";

/**
 * 树的遍历，将用户传入的数据遍历重构成TreeNode结构
 * @param data
 * @param childKey
 */
export const traversal = (
  data: any,
  childKey: KeyConfig = {
    resourceKey: "resources",
    subNodeKey: "subTreeNodes"
  },
  serialConfig: SerialConfig = {
    resourceSerial: "resourceSerial",
    groupSerial: "groupSerial"
  }
): {
  tree: TreeNode[];
  nodes: { [key: string]: TreeNode };
  leaves: { [key: string]: TreeNode };
  nodeLeavesMapping: any;
} => {
  if (!isArray(data)) return traversal([data], childKey);

  const tree: TreeNode[] = [];

  let allNodes: any = {};

  let allLeaves: any = {};

  let nodeLeavesMapping: any = {};

  data.forEach(t => tree.push(travelHelper(t, childKey)));

  return {
    tree,
    nodes: allNodes,
    leaves: allLeaves,
    nodeLeavesMapping
  };

  function travelHelper(originData: any, childKey: KeyConfig) {
    const data = cloneDeep(originData);

    let root = true;

    let maxLevel = 1;

    const rootNode = parseNode(data, childKey, 1);

    rootNode.maxLevel = maxLevel;

    return rootNode;

    function parseNode(node: any, childKey: KeyConfig, level: number) {
      // 记录这个树的最大层级
      if (level > maxLevel) {
        maxLevel = level;
      }

      const hasResource = has(node, childKey.resourceKey);
      const hasSubNode = has(node, childKey.subNodeKey);

      const hasChild = hasResource || hasSubNode;

      let statistics: Statistics = {
        all: hasChild ? 0 : 1,
        selected: 0
      };

      let mappings;

      const config: NodeConfig = {
        id: (hasChild || node[serialConfig.resourceSerial] === undefined)
          ? node[serialConfig.groupSerial]
          : node[serialConfig.resourceSerial],
        type: hasChild ? "node" : "leaf",
        level,
        statistics
      };

      if (hasChild) {
        mappings = nodeLeavesMapping[config.id] = {};
      }

      if (root) {
        config.type = "root";
        root = false;
      }

      const customData = node;

      let subNodes = [];
      let resources = [];

      if (hasResource) {
        resources = node[childKey.resourceKey].map(resource => {
          const leaf = parseNode(resource, childKey, level + 1);
          mappings[leaf._id] = leaf;
          return leaf;
        });
        statistics.all += resources.length;
      }

      if (hasSubNode) {
        subNodes = node[childKey.subNodeKey].map(subNode => {
          const childNode = parseNode(subNode, childKey, level + 1);
          statistics.all += childNode.statistics.all;
          mappings = Object.assign(mappings, nodeLeavesMapping[childNode._id]);
          return childNode;
        });
      }

      // 将 subNode 和 resource 统一为 children
      // 且 subNode 在 resource 之前
      const children = [...subNodes, ...resources];

      delete customData[childKey.resourceKey];
      delete customData[childKey.subNodeKey];

      const treeNode = new TreeNode(customData, children, config);

      if (treeNode.isNode || treeNode.isRoot) allNodes[treeNode._id] = treeNode;

      if (treeNode.isLeaf) allLeaves[treeNode._id] = treeNode;

      return treeNode;
    }
  }
};
