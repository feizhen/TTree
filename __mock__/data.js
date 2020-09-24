/**
 * @param {string} des 对树结构的描述
 * 例如: '1-2-1000'
 * 第一层1个节点、第二层2个节点、第三层1000个节点
 * 1
 *  -- 1.1
 *     -- 1.1.1
 *     -- 1.1.2
 *     ...
 *  -- 1.2
 *     -- 1.2.1
 *     -- 1.2.2
 *     ...
 */
export const genData = des => {
  const levels = des.split("-");

  const depth = levels.length;

  function generate(parent, current) {
    // const counts =
    //   1 + Math.floor(Math.random() * parseInt(levels[current - 1]));
    const counts = parseInt(levels[current - 1]);
    const result = [];
    for (let i = 1; i <= counts; i++) {
      const id = parent === "" ? `${i}` : parent + "-" + i;
      const name = "Level " + id;
      const customData = {
        name
      };

      if (current === depth) {
        result.push(customData);
        customData.resourceSerial = id;
      } else {
        customData.groupSerial = id;
        const subTreeNodes = generate(id, current + 1);
        result.push({ ...customData, subTreeNodes: subTreeNodes });
      }
    }
    return result;
  }

  return generate("", 1);
};

import treeData from "./treeData.json";

export const fetchData = (fake = false) => {
  const p = new Promise(resolve => {
    if (fake) {
      resolve(genData("1-20000"));
    } else {
      resolve(treeData.data.responseData);
    }
  });

  return p;
};
