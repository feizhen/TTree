import TreeNode from "./treeNode";

// Messenger
import Messenger from "./treeMessenger";

// utis
import { traversal } from "./utils/traversal";
import { cloneNode } from "./utils/clone";
import { pagination } from "./utils/pagination";
import { destroyTree } from "./utils/destroyTree";
import { search, searchTravel } from "./utils/search";

// types
import { Statistics, KeyConfig, SerialConfig } from "./types";

// let treeCached: any = {};

class TreeManager {
  isSearch: boolean = false;
  isInitial: boolean = false;

  defaultExpandLevel: number = 0;

  tree: TreeNode[] = [];
  nodes: { [key: string]: TreeNode } = {};
  leaves: { [key: string]: TreeNode } = {};
  nodeLeavesMapping: { [key: string]: { [key: string]: TreeNode } } = {};

  searchTree: TreeNode[] = [];
  searchNodes: { [key: string]: TreeNode } = {};
  searchLeaves: { [key: string]: TreeNode } = {};
  searchNodeLeavesMapping: { [key: string]: TreeNode } = {};

  /**
   * 加载数据
   * @param data
   */
  async loadData(data: any, travelKeys: KeyConfig, travelSrial: SerialConfig) {
    try {
      const {
        tree,
        nodes,
        leaves,
        nodeLeavesMapping
      } = traversal(data, travelKeys, travelSrial);

      this.tree = tree;
      this.nodes = nodes;
      this.leaves = leaves;
      this.nodeLeavesMapping = nodeLeavesMapping;

      // 设置默认展开层级
      this.tree.forEach(root => root.setExpandLevel(this.defaultExpandLevel));

      this.isInitial = true;
      return this;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * ********** getters ***********
   */

  getTree(sync = false, isGetOriginTree = false) {
    if (this.isSearch) {
      this.syncSearchTreeState();
      this.tree.forEach(root => root.getStatistics());
    }
    if (sync) {
      this.tree.forEach(root => root.getStatistics());
    }
    if (this.isSearch && !isGetOriginTree) {
      return this.searchTree
    } else {
      return this.tree;
    }
  }

  /**
   * 获取根节点
   */
  getRoot(): TreeNode[] {
    if (this.isSearch) {
      return cloneNode(this.searchTree);
    } else {
      return cloneNode(this.tree);
    }
  }

  getCurrentNode(node: TreeNode): TreeNode {
    if (this.isSearch) {
      return this.searchNodes[node._id];
    } else {
      return this.nodes[node._id];
    }
  }

  getCurrentLeaf(node: TreeNode): TreeNode {
    if (this.isSearch) {
      return this.searchLeaves[node._id];
    } else {
      return this.leaves[node._id];
    }
  }

  getAllLeafId(): string[] {
    return Object.keys(this.leaves);
  }

  getNLeaf(n: number) {
    const result = [];
    const keys = Object.keys(this.leaves);

    for (let i = 0; i < n && i < keys.length; i++) {
      result.push(this.leaves[keys[i]].customData);
    }

    return result;
  }

  /**
   * 分页加载子节点
   * @param node TreeNode节点
   * @param current 当前页数
   * @param pageSize 每页个数
   */
  getChildren(
    node: TreeNode,
    current: number,
    pageSize: number,
    onlySelected: boolean = false
  ) {
    if (node.isLeaf) {
      return [];
    }

    const parent = this.getCurrentNode(node);

    if (!parent) {
      return []
    }

    let children = parent.children;

    if (onlySelected) children = children.filter(child => child.isSelected);

    return cloneNode(pagination(children, current, pageSize));
  }

  /**
   * 获取节点的统计信息
   * @param node
   */
  getStatistics(node: TreeNode): Statistics {
    const target = node.isLeaf
      ? this.getCurrentLeaf(node)
      : this.getCurrentNode(node);

    return target ? target.getStatistics() : { all: 0, selected: 0 };
  }

  getInitStatistics() {
    let all = 0;
    let selected = 0;
    this.tree.forEach(root => {
      all += root.statistics.all;
      selected += root.statistics.selected;
    });
    return {
      all,
      selected
    };
  }
  /* searchTree => 外部搜索好的tree 直接注入 */
  getSearchTree(
    filterMethod: (node: TreeNode) => boolean,
    searchType: "leaf" | "node",
    searchTree?: any,
  ) {
    // 再去搜索新的树
    if (!searchTree) {
      this.searchTree = this.tree
        .map(t => search(t, filterMethod, searchType))
        .filter(t => t !== null);
    } else {
      this.searchTree = searchTree;
    }

    // 展开最后一层的搜索结果
    this.searchTree.forEach(tree => tree.setExpandLevel(tree.maxLevel));

    // 记录搜索的点位信息
    const { nodes, leaves } = searchTravel(this.searchTree);

    this.searchLeaves = leaves;
    this.searchNodes = nodes;

    const filterNodes = Object.keys(this.searchNodes).filter(key =>
      filterMethod(this.searchNodes[key])
    );

    let nodeCount = filterNodes.length;

    // return Object.keys(this.searchLeaves).length;
    return {
      leaf: Object.keys(this.searchLeaves).length,
      node: nodeCount
    };
  }

  getSearchTreeTransfer(data: any, travelKeys: KeyConfig, travelSrial: SerialConfig) {
    const { tree } = traversal(data, travelKeys, travelSrial);
    return tree
  }

  // 获取所有的选中的叶子节点
  getSelectedLeaf(travelSrial) {
    // 如果是在搜索模式下获取选中的视频源，则需要先同步
    if (this.isSearch) {
      this.syncSearchTreeState();
    }
    const result = [];
    Object.keys(this.leaves).forEach(key => {
      if (this.leaves[key].isSelected && this.leaves[key].customData[travelSrial.resourceSerial]) result.push(this.leaves[key].customData);
    });

    return cloneNode(result);
  }

  /**
   * 获取所有选中的叶子节点
   * 时间复杂度: O(n)
   */
  getAllSelectedLeaf(): {
    result: TreeNode[];
    id: string[];
  } {
    const target = this.isSearch ? this.searchLeaves : this.leaves;
    const keys = Object.keys(target);

    const result = [];
    const id = [];

    keys.forEach(key => {
      const leaf = target[key];
      if (leaf.isSelected) {
        const found = cloneNode(leaf);
        result.push(found);
        id.push(found._id);
      }
    });

    return {
      result,
      id
    };
  }

  getLeafByNode(node: TreeNode): TreeNode[] {
    // 还是要根据isSearch返回特定的节点信息
    if (this.isSearch) {
      return cloneNode(
        this.getCurrentNode(node)
          .getAllLeaf()
          .map(leaf => leaf.customData)
      );
    } else {
      const nodeLeaves = this.nodeLeavesMapping[node._id];
      const result = Object.keys(nodeLeaves).map(key =>
        cloneNode(nodeLeaves[key].customData)
      );
      return result;
    }
  }

  getHighlight(node: TreeNode): boolean {
    return node.isLeaf
      ? this.getCurrentLeaf(node).highlight
      : this.getCurrentNode(node).highlight;
  }
  /**
   * 同步搜索树和原本的树之间的状态
   * 时间复杂度: O(searchLeaves.length)
   */
  syncSearchTreeState() {
    Object.keys(this.searchLeaves).forEach(key => {
      const { isSelected, highlight } = this.searchLeaves[key];
      if (this.leaves[key]) {
        this.leaves[key].setSelect(isSelected);
        this.leaves[key].setHighlight(highlight);
      }
    });
  }

  /**
   * 同步原本的树和搜索树之间的状态
   * 时间复杂度: O(leaves.length)
   */
  syncTreeStateToSearchTree() {
    Object.keys(this.searchLeaves).forEach(key => {
      if (this.leaves[key]) {
        const { isSelected, highlight } = this.leaves[key];
        this.searchLeaves[key].setSelect(isSelected);
        this.searchLeaves[key].setHighlight(highlight);
      }
    });
  }

  /**
   * *********** setters ************
   */
  setIsSearch(newVal: boolean) {
    const escapeSearchMode = this.isSearch === true && newVal === false;
    const reSearch = this.isSearch === true && newVal === true;

    if (escapeSearchMode) {
      // 同步searchTree的勾选状态
      this.syncSearchTreeState();

      // 先销毁之前的搜索结果
      this.destroySearchTree();

      // 重置原来的树
      this.tree.forEach(root => {
        root.resetRender();
        root.setExpandLevel(this.defaultExpandLevel);
      });
    }

    if (reSearch) {
      // 同步searchTree的勾选状态
      this.syncSearchTreeState();

      // 先销毁之前的搜索结果
      this.destroySearchTree();
    }

    this.isSearch = newVal;
  }

  setExpand(node: TreeNode, expand: boolean) {
    const target = this.getCurrentNode(node);
    target.setExpand(expand);
  }

  setSelect(node: TreeNode, select: boolean, deep: boolean = true) {
    const target = node.isLeaf
      ? this.getCurrentLeaf(node)
      : this.getCurrentNode(node);
    if(target) target.setSelect(select, deep);
  }

  setLeafSelect(ids: string[], select: boolean) {
    ids.forEach(id => {
      this.searchLeaves[id] && this.searchLeaves[id].setSelect(select);
      this.leaves[id] && this.leaves[id].setSelect(select);
    });
    Messenger.notify({
      type: "update-statistics",
    });
  }

  setIndeterminate(node: TreeNode, isIndeterminate: boolean) {
    const target = this.getCurrentNode(node);
    if(target) target.setIndeterminate(isIndeterminate);
  }

  setStatistics(node: TreeNode, val: Statistics) {
    if (node.isLeaf) {
      return;
    }

    const originNode = this.nodes[node._id];
    originNode && originNode.setStatistics(val);

    if (this.isSearch) {
      const searchNode = this.searchNodes[node._id];
      searchNode && searchNode.setStatistics(val);
    }
  }

  setChildRendered(node: TreeNode) {
    if (node.isLeaf || node.childRendered) {
      return;
    }

    this.getCurrentNode(node).childRendered = true;
  }

  setDefaultExpandLevel(level: number) {
    this.defaultExpandLevel = level;
  }

  setHighlight(leafSerials: string[], isHighlight: boolean) {
    const leaves = this.isSearch ? this.searchLeaves : this.leaves;
    leafSerials.forEach(serial => {
      if (leaves[serial] && leaves[serial].isLeaf) {
        leaves[serial] && leaves[serial].setHighlight(isHighlight);
      }
    });
    Messenger.notify({
      type: "update-highlight"
    });
  }

  setNodeHighlight(nodeSerials: string[], isHighlight: boolean) {
    const nodes = this.isSearch ? this.searchNodes : this.nodes;
    nodeSerials.forEach(serial => {
      if (nodes[serial] && !nodes[serial].isLeaf) {
        nodes[serial].setHighlight(isHighlight);
      }
    });
    Messenger.notify({
      type: "update-highlight"
    });
  }

  clearSelect() {

    this.searchTree && this.searchTree.forEach(root => root.setSelect(false));

    this.tree && this.tree.forEach(root => root.setSelect(false));

    Messenger.notify({
      type: "clear-select"
    });
  }

  selectAll() {
    this.tree.forEach(root => root.setSelect(true));
  }

  /**
   * 销毁树，必须手动释放深层次的树引用
   * 不然整棵树无法被垃圾回收
   */
  destroyTree() {
    this.tree.forEach(root => {
      destroyTree(root);
      root = null;
    });

    for (const id in this.nodes) {
      destroyTree(this.nodes[id]);
      this.nodes[id] = null;
    }

    for (const id in this.leaves) {
      this.leaves[id] = null;
    }

    for (const id in this.nodeLeavesMapping) {
      this.nodeLeavesMapping[id] = null;
    }

    this.tree = [];
    this.nodes = {};
    this.leaves = {};
  }

  destroySearchTree() {
    this.searchTree.forEach(root => {
      destroyTree(root);
      root = null;
    });

    for (const id in this.searchNodes) {
      destroyTree(this.searchNodes[id]);
      this.searchNodes[id] = null;
    }

    for (const id in this.searchLeaves) {
      this.searchLeaves[id] = null;
    }

    this.searchTree = [];
    this.searchNodes = {};
    this.searchLeaves = {};
  }
}

export default TreeManager;
