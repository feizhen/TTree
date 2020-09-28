import mockData from "../../__mock__/data";
import { traversal } from "../../src/utils/traversal";

describe("traversal函数测试", () => {
  const { tree, nodeMap, leafMap } = traversal(mockData);

  console.log("traversal遍历结果:", {
    tree,
    nodeMap,
    leafMap,
  });

  it("返回tree, nodeMap, leafMap", () => {
    expect(tree).toBeTruthy();
    expect(nodeMap).toBeTruthy();
    expect(leafMap).toBeTruthy();
  });

  it("tree 构建正确", () => {
    expect(tree.id).toEqual("1");
    expect(tree.children).toHaveLength(2);
    expect(tree.data.label).toEqual("层级1");
    expect(tree.data).toEqual(expect.not.objectContaining({ children: [] }));
    expect(tree.statistics.all).toEqual(2);
  });

  it("nodeMap 构建正确", () => {
    expect(nodeMap.size).toEqual(2);
    expect(nodeMap.get("1")).toBeTruthy();
    expect(nodeMap.get("1-2")).toBeTruthy();
  });

  it("leafMap 构建正确", () => {
    expect(leafMap.size).toEqual(2);
    expect(leafMap.get("1-1")).toBeTruthy();
    expect(leafMap.get("1-2-1")).toBeTruthy();
  });
});
