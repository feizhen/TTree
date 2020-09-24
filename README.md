### TTree

### 数据结构

```ts
class TreeNode {
  _id!: string;
  type!: "node" | "leaf" | "root";
  level!: number;
  maxLevel?: number;

  statistics!: Statistics | null;

  // 标志位
  selected: boolean = false;
  expanded: boolean = false;
  highlight: boolean = false;
  indeterminate: boolean = false;
  childRendered: boolean = false;

  customData: any;
  children: TreeNode[] = [];
}
```

TTree 组件内置了遍历函数，会对传进来的树进行遍历，然后重新生成新的树，所以需要保证传入的原始数据是一个树结构、或者树结构数组。树节点的数据结构如上所示。
对于每个节点的用户数据会存在 `TreeNode` 的 `customData` 里

### demo

```html
<template>
  <div>
    <div class="tree-demo">
      <rz-mass-tree
        ref="tree"
        :allowSelect="allowSelect"
        :allowSearch="true"
        :showStatistics="true"
        :selectedId="selectedId"
        :highlights="highlights"
        :nodeHighlights="nodeHighlights"
        :expandLevel="0"
        :icon="{node: 'rz-icon-menu', leaf: 'rz-icon-view'}"
        :draggable="true"
        :onlyShowSelected="true"
        @select-change="handleSelectChange"
        @click="handleClick"
        @node-drag-start="handleDrag"
      ></rz-mass-tree>
      <rz-button size="small" @click.native="handleSetSelect"
        >设置选中点</rz-button
      >
      <rz-button size="small" @click.native="setHightlight">高亮的点</rz-button>
      <rz-button size="small" @click.native="clear">清空选中</rz-button>
      <rz-button size="small" @click.native="getSelectedLeaf"
        >获取选中的点</rz-button
      >
      <rz-button size="small" @click.native="toggleAllowSelect">切换模式</rz-button>
      <rz-button size="small" @click.native="getNLeaf">获取前30个节点</rz-button>
    </div>
  </div>
</template>

<script>
  import { fetchData } from "./__mock__/data.js";
  export default {
    data() {
      return {
        allowSelect: true,
        fakeData: false,
        selectedId: [],
        highlights: [],
        nodeHighlights: [],
        isHighlight: true
      };
    },
    methods: {
      handleSetSelect() {
        this.selectedId = ["1-1-1-1"];
        this.$refs.tree.setSelect(this.selectedId, true);
      },
      handleSelectChange(event) {
        console.log("select change", event);
      },
      setHightlight() {
        this.highlights = this.isHighlight ? ["bDRZvQHmIU"] : [];
        this.isHighlight = !this.isHighlight;
      },
      handleClick(event) {
        console.log("click", event);
      },
      clear() {
        this.$refs.tree.clear();
      },
      getSelectedLeaf() {
        console.log("选中的点", this.$refs.tree.getSelectedLeaf());
      },
      handleDrag(event) {
        console.log(event);
      },
      toggleAllowSelect() {
        this.allowSelect = !this.allowSelect;
      },
      getNLeaf() {
        console.log(this.$refs.tree.getNLeaf(30));
      }
    },
    mounted() {
      fetchData(this.fakeData).then(data => {
        this.$refs.tree.loadData(data).then();
      });
    }
  };
</script>
```

### API

| 参数                  | 说明                                                                                                                                              | 类型                                       | 可选值                                                                                                               | 默认值                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| data                  | 传入的原始数据, 必须得保证是树结构。                                                                                                              | Tree, Tree[]                               | -                                                                                                                    | -                                                               |
| allowSelect           | 是否显示勾选框，是否可勾选                                                                                                                        | boolean                                    | -                                                                                                                    | false                                                           |
| selectAll             | 是否勾选全部                                                                                                                                      | boolean                                    | -                                                                                                                    | false                                                           |
| showStatistics        | 是否显示统计信息, 当 showCount = true 时会隐藏                                                                                                    | boolean                                    | -                                                                                                                    | false                                                           |
| showCount             | 是否显示叶子节点数                                                                                                                                | boolean                                    | -                                                                                                                    | false                                                           |
| showCountKey          | 需要显示在括号内的内容的 key                                                                                                                      | string                                     | -                                                                                                                    | -                                                               |
| labelKey              | 根据哪一个属性值来显示节点名称                                                                                                                    | string                                     | -                                                                                                                    | 'name'                                                          |
| pageSize              | 滚动加载子节点时，每次滚动加载的数量, 建议不要小于 20                                                                                             | number                                     | -                                                                                                                    | 20                                                              |
| icon                  | 叶子节点和非叶子节点的 icon 样式, 不传时则不显示图标                                                                                              | { node: string, leaf: string}              | -                                                                                                                    | -                                                               |
| allowSearch           | 是否开启搜索功能                                                                                                                                  | boolean                                    | -                                                                                                                    | false                                                           |
| hasOptions            | 是否显示搜索选项 (false 则不显示下拉选项,默认 true)                                                                                               | boolean                                    | -                                                                                                                    | true                                                            |
| searchTypeLabel       | 搜索框类型文字提示, 目前的搜索只支持两种类型，按非叶子节点搜索(node),按叶子节点搜索 (leaf)                                                        | {node: string; leaf: string}               | -                                                                                                                    | {node: '部门' , leaf: '视频源'}                                 |
| searchTypePlaceholder | 搜索框类型 placeholder 文字提示, 目前的搜索只支持两种类型，按非叶子节点搜索(node),按叶子节点搜索 (leaf)                                           | {node: string; leaf: string}               | -                                                                                                                    | {node: '请输入部门名称' , leaf: '请输入视频源名称'}             |
| expandLevel           | 默认展开的层级                                                                                                                                    | number                                     | -                                                                                                                    | 0                                                               |
| highlights            | 高亮的数据信息                                                                                                                                    | string[]                                   | serial 数组                                                                                                          | -                                                               |
| nodeHighlights        | 高亮的非叶子节点数据信息                                                                                                                          | string[]                                   | groupSerial 数组                                                                                                     | -                                                               |
| travelKey             | 遍历函数所使用的 健 信息，根据 travelKey 去判断原始的树结构中，哪些属性表示子节点                                                                 | { resourceKey: string, subNodeKey: string} | -                                                                                                                    | {resourceKey: "resources", subNodeKey: "subTreeNodes"}          |
| filterMethod          | 搜索函数,自定义搜索时的筛选函数，内置的搜索函数采用的是 String.includes 方法，target 为 TreeNode 里的 customData 对象，content 为搜索框输入的内容 | (target: any, content: string) => boolean  | 例子: filterMethod = (target: any, content: string) => target.id === content, 用来判断节点的 id 是否和输入的内容相符 | (target: any, content: string) => target.name.includes(content) |
| draggable             | 节点是否可拖拽                                                                                                                                    | boolean                                    | -                                                                                                                    | false                                                           |
| onlyShowSelected | 在非勾选模式下，是否只显示选中的叶子节点 |

### Events

| 事件名            | 说明                   | 参数                                                                 |
| ----------------- | ---------------------- | -------------------------------------------------------------------- |
| click             | 点击节点时触发         | 节点的原始数据                                                       |
| node-click        | 点击节点时触发         | 节点的 TreeNode 数据                                                 |
| hover             | hover 时触发           | 节点的原始数据                                                       |
| node-hover        | hover 时触发           | 节点的 TreeNode 数据                                                 |
| select-change     | 勾选改变时触发         | { select: tree, node: [] } select 属性表示是否选中， node 为数据数组 |
| loaded            | 数据加载完毕时触发     | -                                                                    |
| statistics-loaded | 获取统计信息完毕时触发 | 当前树的统计信息: {selected: number; all: number}                    |
| node-drag         | 拖拽时触发             | {node: TreeNode, event: DragEvent}                                   |
| node-drag-start   | 拖拽开始时触发         | {node: TreeNode, event: DragEvent}                                   |
| node-drag-end     | 拖拽结束时触发         | {node: TreeNode, event: DragEvent}                                   |

### Methods

| 方法名          | 说明                                                    | 参数                                                                                      |
| --------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| destroyTree     | 手动销毁树组件                                          | -                                                                                         |
| loadData        | 加载数据                                                | data: Tree[]                                                                              |
| getTree         | 获取整棵树的数据                                        | -                                                                                         |
| setSelect       | 设置选中节点                                            | { ids: string[], select: boolean} 其中为 ids 为叶子节点的唯一标识符数组, select: 是否选中 |
| getSelectedLeaf | 获取所有选中的叶子节点数据，返回 TreeNode 的 customData | -                                                                                         |
| getLeafByNode   | 获取特定 node 的全部叶子节点                            | node: TreeNode, 需要传 TreeNode 节点，建议使用 node-click 获取点击节点                    |
| getNLeaf        | 获取前N个节点                                          | n: 数量                                                                                   |
| clear           | 清空当前所有已选择的点                                  |                                                                                           |
