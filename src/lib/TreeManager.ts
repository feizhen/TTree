import TreeNode from "./TreeNode";

class TreeManager {
  _tree!: any;
  constructor() {
    this._tree = "Hello World";
  }

  get tree() {
    return this._tree;
  }
}

export default TreeManager;
