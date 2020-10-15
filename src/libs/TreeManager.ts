import TreeNode from "./TreeNode";
import { traversal, TraversalConfig } from "../utils/traversal";

class TreeManager {
  tree!: TreeNode;
  nodeMap!: Map<string, TreeNode>;
  leafMap!: Map<string, TreeNode>;
  nodeLeafMap!: Map<string, TreeNode>;

  /**
   * 加载数据, 构建 TreeNode
   * @param {*} data
   * @param {TraversalConfig} [config={ idKey: "id", childKey: "children" }]
   * @return {*}
   * @memberof TreeManager
   */
  async loadData(
    data: any,
    config: TraversalConfig = { idKey: "id", childKey: "children" }
  ) {
    try {
      const { tree, nodeMap, leafMap } = traversal(data, config);
      this.tree = tree;
      this.nodeMap = nodeMap;
      this.leafMap = nodeMap;
      this.nodeLeafMap = new Map([...nodeMap, ...leafMap]);

      return this;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default TreeManager;
