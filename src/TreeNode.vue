<template>
  <div class="rz-big-data-tree-node" :class="classes" ref="node" @click.stop="handleClick">
    <div
      ref="content"
      class="rz-big-data-tree-node__content"
      :style="childStyle"
      :draggable="draggable"
      @mouseover.stop="handleMouseOver"
      @drag="handleDrag"
      @dragstart="handleDragStart"
      @dragend="handleDragStop"
    >
      <rz-icon
        v-if="!isLeaf"
        name="caret-right"
        class="rz-big-data-tree-node__indicator"
        :class="{ 'rz-big-data-tree-node__indicator--expanded': isExpand }"
        @click.native.stop="toggleExpand"
      ></rz-icon>

      <rz-checkbox
        v-if="showCheckbox"
        class="rz-big-data-tree-node__checkbox"
        :value="isSelect"
        :indeterminate="isIndeterminate"
        @click.native="handleCheckboxClick"
      ></rz-checkbox>

      <!-- icon -->
      <rz-icon
        v-if="currentIcon"
        :label="currentIcon"
        :class="{ 'is-highlight': isHighlight }"
        class="rz-big-data-tree-node__icon"
      ></rz-icon>

      <rz-tooltip
        :disabled="!isOverflow"
        placement="top"
        :content="tooltipContent"
        :open-delay="500"
        :hide-after="10"
      >
        <span
          ref="text"
          class="rz-big-data-tree-node__text"
          :class="{ 'is-highlight': isHighlight }"
          :style="countStyle"
        >{{ label }}</span>
      </rz-tooltip>

      <span
        class="rz-big-data-tree-node__statistics"
        v-if="showStatistics && !showCount && !isLeaf"
        ref="statistics"
      >
        (
        <span>{{ statistics.selected }}</span>
        / {{ statistics.all }}
        )
      </span>

      <!-- leaf count -->
      <span
        class="rz-big-data-tree-node__leafcount"
        ref="count"
        v-if="isShowCount"
      >( {{ showCountText }} )</span>
    </div>

    <div
      ref="childContainer"
      v-if="!isLeaf && isChildRendered"
      v-show="isExpand"
      class="rz-big-date-tree-node__child"
      :class="childClasses"
    >
      <rz-mass-tree-node
        v-for="child in children"
        :key="child._id"
        :node="child"
        :icon="icon"
        :showCheckbox="showCheckbox"
        :showStatistics="showStatistics"
        :labelKey="labelKey"
        :pageSize="pageSize"
        :showCount="showCount"
        :clientHeight="clientHeight"
        :scrollTop="scrollTop"
        :containerOffsetY="containerOffsetY"
        :draggable="draggable"
        :showCountKey="showCountKey"
        :onlyShowSelected="onlyShowSelected"
        @add-selected="handleAddSelected"
        @cut-selected="handleCutSelected"
        @node-click="handleChildClick"
        @node-hover="handleChildHover"
        @leaf-select-change="handleLeafSelectChange"
        @node-select-change="handleNodeSelectChange"
        @node-drag="handleNodeDrag"
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
      ></rz-mass-tree-node>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import TreeNode from "../libs/treeNode";

// components
import RzCheckbox from "pkg/checkbox";
import RzIcon from "pkg/icon";
import RzTooltip from "pkg/tooltip";

// treeMessager
import { store, Message } from "../libs/treeMessenger";

// mixins
import Emitter from "../../../src/mixins/emitter.js";

// types
import { Statistics } from "../libs/types";
import TreeManager from "../libs/treeManager";

@Component({
  name: "RzMassTreeNode",
  components: {
    RzCheckbox,
    RzIcon,
    RzTooltip
  },
  mixins: [Emitter],
  inject: ["treeManager"]
})
export default class MassTreeNode extends Vue {
  // broadcast
  readonly broadcast!: (
    componentName: string,
    eventName: string,
    params: any
  ) => void;

  readonly treeManager: TreeManager;

  @Prop() node!: TreeNode;

  @Prop() icon!: { node: string; leaf: string };

  @Prop() scrollHeight!: number;

  @Prop() scrollTop!: number;

  @Prop() clientHeight!: number;

  @Prop() containerOffsetY!: number;

  @Prop() labelKey!: string;

  @Prop({ default: true }) showCheckbox!: boolean;

  @Prop({ default: true }) showStatistics!: boolean;

  @Prop({ default: false }) showCount!: boolean;

  @Prop({ default: 20 }) pageSize!: number;

  @Prop({
    type: Boolean,
    default: false
  })
  draggable: boolean;

  @Prop(String) showCountKey: string;

  @Prop({
    type: Boolean,
    default: false
  })
  onlyShowSelected: boolean;

  get customData() {
    return this.node.customData;
  }

  get isRoot(): boolean {
    return this.node.isRoot;
  }

  get isNode(): boolean {
    return this.node.isNode;
  }

  get isLeaf(): boolean {
    return this.node.isLeaf;
  }

  get classes() {
    return {
      "is-leaf": this.isLeaf,
      "is-node": !this.isLeaf
    };
  }

  get childClasses() {
    return {
      "is-expanded": this.isExpand
    };
  }

  get childStyle() {
    const basic = 8;
    const delta = 24;
    const level = this.isLeaf ? this.node.level : this.node.level - 1;

    const value = this.isLeaf ? level * delta : level * delta + basic;
    return {
      paddingLeft: `${value}px`
    };
  }

  get label() {
    return this.customData[this.labelKey] || "";
  }

  get currentIcon() {
    if (this.icon) {
      return this.isLeaf ? this.icon.leaf : this.icon.node;
    } else {
      return "";
    }
  }

  get isShowCount(): boolean {
    if (this.showCount && this.showCountKey) {
      return true;
    } else if (this.showCount && !this.isLeaf) {
      return true;
    } else {
      return false;
    }
  }

  get showCountText() {
    if (this.showCountKey) {
      return this.node.customData[this.showCountKey] || "";
    }
    return this.statistics.all;
  }

  get tooltipContent(): string {
    // 业务上不显示
    // if (this.showCount) {
    //   return `${this.label} (${this.showCountText})`;
    // }

    // 业务上不显示
    // if (this.showStatistics) {
    //   return `${this.label} (${this.statistics.selected} / ${this.statistics.all})`;
    // }
    return `${this.label}`;
  }

  get countStyle() {
    let style: any = {
      maxWidth: this.textMaxWidth + "px",
      minWidth: this.textMinWidth + "px"
    };
    return style;
  }

  get onlySelected(): boolean {
    if (this.showCheckbox) {
      return false
    } else {
      return this.onlyShowSelected;
    }
  }

  @Watch('onlySelected')
  onChange(val) {
    // todo: 待完善在不同模式的切换下的显示问题
  }

  /**
   * *********** data ************
   */

  // messager = messager;

  children: TreeNode[] = [];

  statistics: Statistics = { all: 0, selected: 0 };

  isExpand: boolean = this.node.expanded;

  isSelect: boolean = this.node.isSelected;

  isChildRendered: boolean = this.node.childRendered;

  isIndeterminate: boolean = this.node.isIndeterminate;

  isHighlight: boolean = this.node.highlight;

  currentPage: number = 1;

  nodeHeight: number = 0;

  textMaxWidth: number = 1000;

  textMinWidth: number = 0;

  isOverflow: boolean = false;

  loadingChildren: boolean = false;

  get message() {
    return store.getters.getMessage;
  }

  @Watch("message")
  whenRecieveMessage(val) {
    this.handleMessage(val);
  }

  @Watch("node")
  whenNodeChange(val) {
    // 每次数据变更都初始化
    if (val) {
      this.initial();
    }
  }

  @Watch("isChildRendered", { immediate: true })
  whenNeedToRenderChild(needed: boolean) {
    if (needed) {
      setTimeout(() => {
        this.getChildren();
      }, 0);
    }
  }

  @Watch("statistics", { deep: true })
  onStatisticsChange(val: Statistics) {
    if (val) {
      const { all, selected } = val;

      this.treeManager.setStatistics(this.node, val);

      this.isSelect = selected > 0;
      this.treeManager.setSelect(this.node, this.isSelect, false);

      if (!this.isLeaf) {
        this.isIndeterminate = selected > 0 && selected < all;
        this.treeManager.setIndeterminate(this.node, this.isIndeterminate);
      }
    }
  }

  /**
   * 滚动加载核心
   */
  @Watch("scrollTop")
  onScrollTopChange() {
    if (this.isLeaf || !this.containerOffsetY) {
      return;
    }

    if (this.isExpand) {
      const nodeElm = this.$refs.node as Element;
      const rect = nodeElm.getBoundingClientRect();
      const contentHeight = rect.height;
      const topOffset = rect.top - this.containerOffsetY;

      // 当前节点的元素底部距离视窗顶部的距离: contentHeight + topOffset

      // 已在视窗外的不加载
      if (contentHeight + topOffset < 0) {
        return;
      }

      // 换成REM之后，样式计算会有问题
      if (!this.nodeHeight) {
        this.computeElmRect();
      }

      // 当滑到最后 BUFFER 个元素的时候开始去加载
      const BUFFER = 2;

      const isToBottom =
        contentHeight + topOffset <
        this.clientHeight + this.nodeHeight * BUFFER;

      // 快滚到当前元素底部时，动态加载
      if (isToBottom) {
        setTimeout(() => {
          this.getChildren();
        }, 0)
      }
    }
  }

  @Watch("showStatistics")
  onShowStatisticsChange(val) {
    if (val) {
      this.$nextTick(this.computeXScroll);
    }
  }

  @Watch("showCount", { immediate: true })
  onShowCountChange(val) {
    if (val) {
      this.$nextTick(() => {
        this.computeXScroll(true);
      });
    }
  }

  toggleExpand() {
    this.isExpand = !this.isExpand;

    this.treeManager.setExpand(this.node, this.isExpand);

    if (!this.isChildRendered) {
      this.isChildRendered = true;
      this.treeManager.setChildRendered(this.node);
    }
  }

  /**
   * ********* handlers ***********
   */

  handleCheckboxClick(event: MouseEvent) {
    event.stopPropagation();

    if (this.isIndeterminate) {
      this.isSelect = true;
    } else {
      this.isSelect = !this.isSelect;
    }

    this.treeManager.setSelect(this.node, this.isSelect);
    this.updateStatistics(this.isSelect);
    this.emitSelectChange(this.isSelect);
    // 向下传播
    this.broadcast(
      "RzMassTreeNode",
      "parent-node-select-change",
      this.isSelect
    );
  }

  handleAddSelected(data) {
    const { all, selected } = this.statistics;

    this.statistics.selected = selected + data > all ? all : selected + data;

    this.$emit("add-selected", data);
  }

  handleCutSelected(data) {
    const { all, selected } = this.statistics;

    this.statistics.selected = selected - data < 0 ? 0 : selected - data;

    this.$emit("cut-selected", data);
  }

  handleClick() {
    this.$emit("node-click", this.node);
  }

  handleChildClick(event) {
    this.$emit("node-click", event);
  }

  handleMouseOver() {
    this.$emit("node-hover", this.node);
  }

  handleChildHover(event) {
    this.$emit("node-hover", event);
  }

  handleLeafSelectChange(event) {
    this.$emit("leaf-select-change", event);
  }

  handleNodeSelectChange(event) {
    this.$emit("node-select-change", event);
  }

  handleDrag(event: DragEvent) {
    this.$emit("node-drag", this.node, event);
  }

  handleDragStart(event) {
    this.$emit("node-drag-start", this.node, event);
  }

  handleDragStop(event) {
    this.$emit("node-drag-end", this.node, event);
  }

  handleNodeDrag(node, event) {
    this.$emit("node-drag", node, event);
  }

  handleNodeDragStart(node, event) {
    this.$emit("node-drag-start", node, event);
  }

  handleNodeDragEnd(node, event) {
    this.$emit("node-drag-end", node, event);
  }

  getChildren() {
    if (this.loadingChildren) {
      return;
    }

    this.loadingChildren = true;

    const children = this.treeManager.getChildren(
      this.node,
      this.currentPage++,
      this.pageSize,
      this.onlySelected
    );

    this.children.push(...children);

    this.$nextTick(() => {
      this.loadingChildren = false;
    })

  }

  getStatistics() {
    if (this.showCheckbox || this.showStatistics || this.showCount) {
      this.statistics = this.treeManager.getStatistics(this.node);
    }

    if (!this.isLeaf && this.onlySelected) {
      this.initChildren();
    }
  }

  initChildren() {
    this.currentPage = 1;
    this.children = [];
    this.getChildren();
  }

  initial() {
    this.initChildren();
    this.getStatistics();
  }

  updateStatistics(select: boolean) {
    if (select) {
      if (this.isLeaf) {
        this.$emit("add-selected", 1);
      } else {
        const addition = this.statistics.all - this.statistics.selected;
        this.statistics.selected = this.statistics.all;
        this.$emit("add-selected", addition);
      }
    } else {
      if (this.isLeaf) {
        this.$emit("cut-selected", 1);
      } else {
        this.statistics.selected = 0;
        this.$emit("cut-selected", this.statistics.all);
      }
    }
  }

  updateHighlight() {
    this.isHighlight = this.treeManager.getHighlight(this.node);
  }

  emitSelectChange(select: boolean) {
    this.$emit(this.isLeaf ? "leaf-select-change" : "node-select-change", {
      select,
      node: this.node
    });
  }

  /**
   * ********* lifecycle ********
   */

  created() {
    this.getStatistics();
  }

  mounted() {
    this.computeXScroll();
    this.computeElmRect();

    this.$on("parent-node-select-change", (select: boolean) => {
      if (select) {
        this.statistics.selected = this.statistics.all;
      } else {
        this.statistics.selected = 0;
      }

      this.isSelect = select;
      this.treeManager.setSelect(this.node, select, false);

      // 继续向下传播
      this.broadcast(
        "RzMassTreeNode",
        "parent-node-select-change",
        this.isSelect
      );
    });
  }

  beforeDestroy() {
    this.children = [];
  }

  /**
   *  ********* others *************
   */

  handleMessage(val: Message) {
    // 处理通知
    switch (val.type) {
      case "update-statistics":
        this.getStatistics();
        break;

      case "update-highlight":
        this.updateHighlight();
        break;

      case "clear-select":
        this.isSelect = false;
        this.statistics.selected = 0;
        break;

      default:
        return;
    }
  }

  computeXScroll(customCount = false) {
    const text = this.$refs.text as Element;

    const content = this.$refs.content as Element;
    const contentStyle = getComputedStyle(content);
    const contentWidth = parseInt(contentStyle.width);
    const contentPaddingLeft = parseInt(contentStyle.paddingLeft);

    const bracket = this.showCount
      ? this.$refs.count
      : this.showStatistics
        ? this.$refs.statistics
        : null;

    const indicatorWidth = !this.isLeaf ? 14 : 0;

    const checkboxWidth = this.showCheckbox ? 18 : 0;

    const margin = 24;

    let barcketWidth = 0;

    let iconWidth = 0;

    if (bracket) {
      barcketWidth = parseInt(getComputedStyle(bracket as HTMLElement).width);
    }

    if (this.currentIcon) {
      iconWidth = 22;
    }

    this.textMaxWidth =
      contentWidth -
      contentPaddingLeft -
      barcketWidth -
      indicatorWidth -
      checkboxWidth -
      iconWidth -
      margin;

    if (customCount) {
      this.textMinWidth = this.textMaxWidth;
    }

    this.isOverflow = text.scrollWidth > this.textMaxWidth;
  }

  computeElmRect() {
    const node = this.$refs.node as Element;
    const style = getComputedStyle(node);
    this.nodeHeight = parseInt(style.height as string);
  }
}
</script>
