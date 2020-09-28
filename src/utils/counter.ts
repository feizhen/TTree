import TreeNode, { StatisticsInfo } from "../libs/TreeNode";

export function counter(node: TreeNode): StatisticsInfo {
  if (node.isLeaf) {
    return {
      all: 1,
      selected: node.isSelected ? 1 : 0,
    };
  } else {
    let all = 0;
    let selected = 0;
    if (node.hasChildren) {
      node.children.forEach((n) => {
        const childCount = counter(n);

        all += childCount.all;
        selected += childCount.selected;
      });
    }

    /**
     * 对于非叶子节点来说，当其子节点有被选中时，我们就认为该节点也是被选中的
     */
    node.setSelect(selected > 0);

    /**
     * 对于非叶子节点来说，当其部分子节点选中时，其是部分选中的状态
     */
    if (selected > 0 && selected < all) {
      node.setIndeterminate(true);
    } else {
      node.setIndeterminate(false);
    }

    return {
      all,
      selected,
    };
  }
}
