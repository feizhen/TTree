import TreeManager from "../src/index";

describe("TreeManager Test", () => {
  it("初始化TreeManager", () => {
    const tm = new TreeManager();
    expect(tm.tree).toBe("HelloWorld");
  });
});
