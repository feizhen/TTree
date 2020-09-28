import mockData from "../__mock__/data";
import TreeManager from "../src/index";

describe("TreeManager Test", () => {
  const tm = new TreeManager();
  it("loadData 函数功能测试", async () => {
    await tm.loadData(mockData);

    expect(tm.tree).toBeTruthy();
    expect(tm.nodeLeafMap.size).toEqual(4);
  });
});
