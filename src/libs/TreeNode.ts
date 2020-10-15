import { counter } from "../utils/counter";

export type TreeNodeType = "node" | "leaf" | "root";

export interface StatisticsInfo {
  all: number;
  selected: number;
}

export interface NodeConfig {
  id: string;
  type: TreeNodeType;
  statistics: StatisticsInfo;
  level: number;
}

class TreeNode {
  _id!: string;

  /**
   * 节点类型
   */
  type!: TreeNodeType;

  /**
   * 节点层级
   */
  level!: number;

  /**
   * 节点统计信息
   */
  statistics: StatisticsInfo = {
    all: 0,
    selected: 0,
  };

  /**
   * 节点数据
   */
  data!: any;

  /**
   * 子节点数组
   */
  children: TreeNode[] = [];

  /**
   * 节点是否选中
   */
  selected: boolean = false;

  /**
   * 节点是否展开 （非叶子节点）
   */
  expanded: boolean = false;

  /**
   * 节点是否部分选中 (非叶子节点)
   */
  indeterminate: boolean = false;

  /**
   * 子节点是否渲染 (非叶子节点)
   */
  childRendered: boolean = false;

  constructor(customData: any, children: any, initConfig: NodeConfig) {
    this.data = customData;
    this.children = children;
    const { id, type, statistics, level } = initConfig;
    this._id = id;
    this.type = type;
    this.statistics = statistics;
    this.level = level;
  }

  get id(): string {
    return this._id;
  }

  get isLeaf(): boolean {
    return this.type === "leaf";
  }

  get isNode(): boolean {
    return this.type === "node";
  }

  get isRoot(): boolean {
    return this.type === "root";
  }

  get isSelected(): boolean {
    return this.selected;
  }

  get isIndeterminate(): boolean {
    return this.indeterminate;
  }

  get hasChildren(): boolean {
    return !this.isLeaf && this.children.length > 0;
  }

  /**
   * 勾选/反选节点
   * @param {boolean} value 是否勾选/反选
   * @param {{deep: boolean}} [{deep:true}] 是否递归勾选/反选子节点
   * @memberof TreeNode
   */
  setSelect(value: boolean, config: { deep: boolean } = { deep: true }) {
    this.selected = value;
    if (config.deep) {
      this.children.forEach((child) => child.setSelect(value, config));
    }
  }

  setIndeterminate(value: boolean) {
    this.indeterminate = value;
  }

  setStatistics(stat: StatisticsInfo) {
    this.statistics = stat;
  }

  setExpand(value: boolean) {
    if (this.isLeaf) {
      return;
    }
    this.expanded = value;
  }

  setChildRendered() {
    if (this.isLeaf && this.childRendered) {
      return;
    }
    this.childRendered = true;
  }

  /**
   * 重置当前节点的渲染情况
   */
  resetRender() {
    this.setExpand(false);
    this.childRendered = false;
    this.children.forEach((child) => child.resetRender());
  }

  /**
   * 清空节点状态
   */
  clearState() {
    this.setSelect(false);
    this.setIndeterminate(false);
    this.children.forEach((child) => child.clearState());
  }

  /**
   * 获取当前节点的统计信息
   */
  getStatistics(): StatisticsInfo {
    return counter(this);
  }
}

export default TreeNode;
