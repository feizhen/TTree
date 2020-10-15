import mockData from "../../__mock__/data";
import { traversal } from "../../src/utils/traversal";

describe("TreeNode功能测试", () => {
  const { tree } = traversal(mockData);

  it("顶层节点 isRoot = true", () => {
    expect(tree.isRoot).toBeTruthy();
  });

  it("顶层节点 hasChildren = true", () => {
    expect(tree.hasChildren).toBeTruthy();
  });

  it("setSelect函数", () => {
    expect(tree.isSelected).toBeFalsy();
    tree.setSelect(true);
    expect(tree.isSelected).toBeTruthy();
    expect(tree.children[0].isSelected).toBeTruthy();

    tree.setSelect(false);
    expect(tree.isSelected).toBeFalsy();
    expect(tree.children[0].isSelected).toBeFalsy();

    tree.setSelect(true, { deep: false });
    expect(tree.isSelected).toBeTruthy();
    expect(tree.children[0].isSelected).toBeFalsy();
  });
});
