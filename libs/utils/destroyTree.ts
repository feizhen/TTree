import TreeNode from "../treeNode";

export const destroyTree = (tree: TreeNode) => {
  destroyHelper(tree);

  function destroyHelper(node: TreeNode) {
    if (node.isLeaf) {
      node = null;
    } else {
      node.children &&
        node.children.forEach(child => {
          destroyHelper(child);
        });

      node.children = null;
    }

    node = null;
  }
};
