<template>
  <!-- todo 国际化 -->
  <!-- 编写 massTree 组件 -->
  <div class="rz-big-data-tree__container">
    <div class="rz-big-data-tree__search" v-if="allowSearch">
      <rz-search-input
        :options="searchInputOptions"
        :placeholder="searchInputPlaceholder[searchIndex]"
        :focusActive="true"
        v-model="keyword"
        @select-change="handleSearchTypeChange"
        @search="handleSearch"
        @clear="handleClear"
      ></rz-search-input>
    </div>

    <div class="rz-big-data-tree__search-result" v-if="showSearchResult" ref="searchResult">
      <span>{{ t('el.massTree.search') }}</span>
      <span>"{{searchKeyword}}"</span>
      <span>{{ t('el.massTree.searchResult', { searchCount: searchCount, searchType: searchInputOptions[searchIndex].label})}}</span>
    </div>

    <div
      v-if="!isSearch"
      key="tree"
      ref="tree"
      class="rz-big-data-tree root-tree"
      :style="{'height': styleHeight}"
      @scroll="handleScroll"
      v-loading="loading"
      razor-loading-text="拼命加载中"
    >
      <rz-placeholder v-if="showPlaceholder.show" :emptyText="showPlaceholder.text"></rz-placeholder>
      <rz-mass-tree-node
        v-else
        v-for="root in data"
        :key="root._id"
        :node="root"
        :showCheckbox="allowSelect"
        :showStatistics="showStatistics"
        :clientHeight="clientHeight"
        :labelKey="labelKey"
        :pageSize="pageSize"
        :icon="icon"
        :showCount="showCount"
        :scrollTop="scrollTop"
        :containerOffsetY="containerOffsetY"
        :draggable="draggable"
        :showCountKey="showCountKey"
        :onlyShowSelected="onlyShowSelected"
        @add-selected="handleAddSelected"
        @cut-selected="handleCutSelected"
        @node-click="handleClick"
        @node-hover="handleHover"
        @leaf-select-change="handleLeafSelectChange"
        @node-select-change="handleNodeSelectChange"
        @node-drag="handleDrag"
        @node-drag-start="handleDragStart"
        @node-drag-end="handleDragStop"
      ></rz-mass-tree-node>
    </div>

    <div
      v-else
      key="searchTree"
      ref="tree"
      class="rz-big-data-tree root-tree"
      :style="{'height': styleHeight}"
      @scroll="handleScroll"
    >
      <rz-placeholder v-if="showPlaceholder.show" :emptyText="showPlaceholder.text"></rz-placeholder>
      <rz-mass-tree-node
        v-else
        v-for="root in data"
        :key="root._id"
        :node="root"
        :showCheckbox="allowSelect"
        :showStatistics="showStatistics"
        :clientHeight="clientHeight"
        :labelKey="labelKey"
        :pageSize="pageSize"
        :icon="icon"
        :showCount="showCount"
        :scrollTop="scrollTop"
        :containerOffsetY="containerOffsetY"
        :draggable="draggable"
        :showCountKey="showCountKey"
        :onlyShowSelected="onlyShowSelected"
        @add-selected="handleAddSelected"
        @cut-selected="handleCutSelected"
        @node-click="handleClick"
        @node-hover="handleHover"
        @leaf-select-change="handleLeafSelectChange"
        @node-select-change="handleNodeSelectChange"
        @node-drag="handleDrag"
        @node-drag-start="handleDragStart"
        @node-drag-end="handleDragStop"
      ></rz-mass-tree-node>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch, Emit } from "vue-property-decorator";

// components
import RzMassTreeNode from "./TreeNode.vue";
import RzInputSearch from "pkg/searchInput";
import RzPlaceholder from "pkg/placeholder";

// TreeNode
import TreeNode from "../libs/treeNode";

// TreeManager
import TreeManager from "../libs/treeManager";

// types
import { KeyConfig, SerialConfig } from "../libs/types";

// utils
import isFunction from "lodash/isFunction";
import isArray from "lodash/isArray";
import { cloneNode } from "../libs/utils/clone";
import { diff } from "../libs/utils/diff";

import { t } from "rz/locale";
// mixins
import Emitter from "../../../src/mixins/emitter.js";

import Locale from "rz/mixins/locale";

@Component({
  name: "MassTree",
  components: {
    RzMassTreeNode,
    RzInputSearch,
    RzPlaceholder,
  },
  mixins: [Emitter, Locale],
  provide() {
    return {
      treeManager: new TreeManager(),
    };
  },
})
export default class MassTree extends Vue {
  readonly broadcast!: (componentName: string, eventName: string, params: any) => void;

  readonly _provided: { treeManager: TreeManager };

  @Prop({ default: false }) loading: boolean;

  @Prop({ default: false }) allowSelect: boolean;

  @Prop({ default: false }) selectAll: boolean;

  @Prop({ default: false }) showStatistics: boolean;

  @Prop({ default: false }) showCount: boolean;

  @Prop({ default: "name" }) labelKey: string;

  @Prop({ default: 20 }) pageSize: number;

  @Prop() icon!: { node: string; leaf: string };

  @Prop({ default: false }) allowSearch!: boolean;

  @Prop({ default: 0 }) expandLevel!: number; // 默认展开的层级

  @Prop(Function) filterMethod: (target: any, content: string) => boolean;

  @Prop() highlights: string[];

  @Prop() nodeHighlights: string[];

  @Prop({ default: true }) hasOptions: boolean;

  @Prop({
    default() {
      return {
        resourceKey: "resources",
        subNodeKey: "subTreeNodes",
      };
    },
  })
  travelKey: KeyConfig;

  @Prop({
    default() {
      return {
        node: t("el.massTree.group"),
        leaf: t("el.massTree.camera"),
      };
    },
  })
  searchTypeLabel: { node: string; leaf: string };

  @Prop({
    default() {
      return {
        node: t("el.massTree.groupPlaceholder"),
        leaf: t("el.massTree.cameraPlaceholder"),
      };
    },
  })
  searchTypePlaceholder: { node: string; leaf: string };

  @Prop({
    default() {
      return {
        resourceSerial: "resourceSerial",
        groupSerial: "groupSerial",
      };
    },
  })
  travelSerial: SerialConfig;

  @Prop({
    type: Boolean,
    default: false,
  })
  draggable: boolean;

  @Prop(String) showCountKey: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  onlyShowSelected: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  searchInject: boolean;

  /**
   * ************ data *************
   */
  data: any | TreeNode[] = [];

  // 样式相关属性
  containerOffsetY: number = 0;

  scrollTop: number = 0;

  clientHeight: number = 0;

  // 搜索相关
  keyword: string = "";

  isSearch: boolean = false;

  searchIndex: number = 0;

  styleHeight: string = "100%";

  searchCount: number = 0;

  searchKeyword: string = "";

  get showSearchResult() {
    return this.isSearch && this.searchKeyword.length;
  }

  /**
   * ********* getters ************
   */

  @Watch("allowSearch")
  onAllowSearchChange(val: boolean) {
    if (val) {
      this.updateStyleheight(this.isSearch);
    } else {
      this.styleHeight = "100%";
    }
  }

  @Watch("isSearch")
  updateStyleheight(isSearch: boolean) {
    const searchbarHeight = 50;
    if (this.showSearchResult) {
      this.$nextTick(() => {
        const refSearchResult = this.$refs.searchResult as HTMLElement;
        const searchResultHeight = parseInt(getComputedStyle(refSearchResult).height);
        const padding = 24;

        // update style
        this.styleHeight = `calc(100% - ${searchbarHeight + searchResultHeight + padding}px)`;
        this.getStyleValue();
      });
    } else {
      this.styleHeight = `calc(100% - ${searchbarHeight}px)`;
      this.getStyleValue();
    }
  }

  get searchType(): "node" | "leaf" {
    return this.searchInputOptions[this.searchIndex].value;
  }

  get searchInputOptions(): { value: "node" | "leaf"; label: string }[] {
    if (this.hasOptions) {
      const { node, leaf } = this.searchTypeLabel;
      return [
        {
          value: "leaf",
          label: leaf,
        },
        {
          value: "node",
          label: node,
        },
      ];
    } else {
      return [];
    }
  }

  get searchInputPlaceholder(): { [key: number]: string } {
    const { node, leaf } = this.searchTypePlaceholder;
    return {
      0: leaf,
      1: node,
    };
  }

  @Emit("search")
  handleSearchEmit(searchData: { keyword: string; searchType: "node" | "leaf" }) {
    return searchData;
  }

  get showPlaceholder(): { show: boolean; text: string } {
    let result = {
      show: false,
      text: t("el.massTree.noData"),
    };

    result.show = this.data.length === 0 && !this.loading;
    result.text = this.isSearch ? t("el.massTree.noResult") : t("el.massTree.noData");

    return result;
  }

  filterFn() {
    const defaultFilterMethod = (node: TreeNode, content) => {
      const isIncluded = node.customData.name.toLowerCase().includes(content.toLowerCase());

      let visiabled = false;

      if (this.allowSelect) {
        visiabled = true;
      } else {
        visiabled = this.onlyShowSelected ? node.isSelected : true;
      }

      return isIncluded && visiabled;
    };

    return (node: TreeNode) => {
      if (isFunction(this.filterMethod)) {
        return this.filterMethod(node, this.keyword);
      }

      return defaultFilterMethod(node, this.keyword);
    };
  }

  @Watch("highlights", { immediate: true })
  whenHighlightsChange(newVal: string[], oldVal: string[]) {
    if (!isArray(newVal) || !isArray(oldVal)) {
      return;
    }
    const reducer = diff(newVal, oldVal);

    this._provided.treeManager.setHighlight(reducer, false);
    this._provided.treeManager.setHighlight(newVal, true);
  }

  @Watch("nodeHighlights", { immediate: true })
  whenNodeHighlightsChange(newVal: string[], oldVal: string[]) {
    if (!isArray(newVal) || !isArray(oldVal)) {
      return;
    }
    const reducer = diff(newVal, oldVal);

    this._provided.treeManager.setNodeHighlight(reducer, false);
    this._provided.treeManager.setNodeHighlight(newVal, true);
  }

  /**
   * *********** apis *************
   */

  /**
   * 异步加载数据，避免Vue的observer
   */
  async loadData(data: any) {
    try {
      // 如果重新加载数据，则需要删除上一次的数据;
      if (this._provided.treeManager.isInitial) {
        this._provided.treeManager.destroyTree();
        this._provided.treeManager.destroySearchTree();
      }
      // 先设置默认展开的层级
      if (this.expandLevel > 0) {
        this._provided.treeManager.setDefaultExpandLevel(this.expandLevel);
      }

      const tm = await this._provided.treeManager.loadData(data, this.travelKey, this.travelSerial);

      if (this.selectAll) {
        this._provided.treeManager.selectAll();
      }

      this.data = Object.freeze(tm.getRoot());

      this._provided.treeManager.setIsSearch(false);

      this.$emit("loaded");

      this.$nextTick(() => {
        this.$emit("statistics-loaded", this._provided.treeManager.getInitStatistics());
      });
      return;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // 获取整棵树的数据
  getTree(isGetOriginTree) {
    const sync = false;
    return this._provided.treeManager.getTree(sync, isGetOriginTree);
  }

  /**
   * 设置选中的节点
   */
  setSelect(ids: string[], select: boolean) {
    this._provided.treeManager.setLeafSelect(ids, select);
  }

  /**
   * 获取选中的节点
   */
  getSelectedLeaf() {
    return this._provided.treeManager.getSelectedLeaf(this.travelSerial);
  }

  getLeafByNode(node) {
    return this._provided.treeManager.getLeafByNode(node);
  }

  getAllLeafId(): string[] {
    return this._provided.treeManager.getAllLeafId();
  }

  getNLeaf(n: number) {
    return this._provided.treeManager.getNLeaf(n);
  }

  // 暂时舍弃
  selectNLeaf(n: number) {
    // this._provided.treeManager.selectNLeaf(n);
  }

  /**
   * 清空选中
   */
  clear() {
    this._provided.treeManager.clearSelect();
  }

  destroyTree() {
    this._provided.treeManager.destroyTree();
    this._provided.treeManager.destroySearchTree();
    this.data = Object.freeze([]);
  }

  /**
   * ********* lifecycle **********
   */

  mounted() {
    this.getStyleValue();
  }

  beforeDestroy() {
    this.destroyTree();
  }

  /**
   * ********* handlers ***********
   */

  handleScroll(event: Event) {
    const container = event.target as Element;
    const { scrollTop } = container;
    this.scrollTop = scrollTop;
  }

  handleSearch() {
    if (this.keyword === "") {
      this.handleClear();
      this.searchKeyword = this.keyword;
      return;
    }
    /* 这里如果搜索动作由外面触发,这里emit */
    if (this.searchInject) {
      const { keyword, searchType } = this;
      const searchData: { keyword: string; searchType: "node" | "leaf" } = {
        keyword,
        searchType,
      };
      this.handleSearchEmit(searchData);
      return;
    }

    this.isSearch = true;
    this._provided.treeManager.setIsSearch(this.isSearch);

    const searchResult = this._provided.treeManager.getSearchTree(this.filterFn(), this.searchType);

    this.searchCount = this.searchType === "node" ? searchResult.node : searchResult.leaf;

    this.data = Object.freeze(this._provided.treeManager.getTree());
    this.broadcast("RzMassTreeNode", "update-children-node", {});
    this.searchKeyword = this.keyword;
  }

  async loadSearchTreeData(data) {
    this.isSearch = true;
    this._provided.treeManager.setIsSearch(this.isSearch);

    /* 整理数据 */
    const searchTree = this._provided.treeManager.getSearchTreeTransfer(data, this.travelKey, this.travelSerial);

    const searchResult = await this._provided.treeManager.getSearchTree(this.filterFn(), this.searchType, searchTree);

    /* 同步状态 */
    this._provided.treeManager.syncTreeStateToSearchTree();

    this.searchCount = this.searchType === "node" ? searchResult.node : searchResult.leaf;

    this.data = Object.freeze(this._provided.treeManager.getTree());

    this.broadcast("RzMassTreeNode", "update-children-node", {});

    this.searchKeyword = this.keyword;

    this.isSearch = !!this.searchKeyword.length;
  }

  handleClear() {
    if (!this.isSearch) {
      return;
    }
    this.$emit("clear");
    this.isSearch = false;
    this._provided.treeManager.setIsSearch(this.isSearch);
    this.data = Object.freeze(this._provided.treeManager.getTree());
  }

  handleSearchTypeChange(key: number) {
    this.searchIndex = key;
    this.handleSearch();
  }

  handleAddSelected(data) {
    this.$emit("add-selected", data);
  }

  handleCutSelected(data) {
    this.$emit("cut-selected", data);
  }

  handleClick(node: TreeNode) {
    let target;
    if (node.isLeaf) {
      target = cloneNode(this._provided.treeManager.getCurrentLeaf(node));
    } else {
      target = cloneNode(this._provided.treeManager.getCurrentNode(node));
    }

    this.$emit("node-click", target);
    this.$emit("click", target.customData);
  }

  handleHover(node: TreeNode) {
    const target = cloneNode(this._provided.treeManager.getCurrentNode(node) || this._provided.treeManager.getCurrentLeaf(node));

    this.$emit("node-hover", target);
    this.$emit("hover", target.customData);
  }

  handleLeafSelectChange(event) {
    const { select, node } = event;
    const leaf: TreeNode = this._provided.treeManager.getCurrentLeaf(node);
    this.$emit("select-change", {
      select,
      node: [cloneNode(leaf.customData)],
    });
  }

  handleNodeSelectChange(event) {
    const { select, node } = event;
    const currentNode: TreeNode = this._provided.treeManager.getCurrentNode(node);
    this.$emit("select-change", {
      select,
      node: this._provided.treeManager.getLeafByNode(node),
    });
  }

  handleDrag(node: TreeNode, event: DragEvent) {
    this.$emit("node-drag", node, event);
  }

  handleDragStart(node: TreeNode, event: DragEvent) {
    this.$emit("node-drag-start", node, event);
  }

  handleDragStop(node: TreeNode, event: DragEvent) {
    this.$emit("node-drag-end", node, event);
  }

  /**
   * ********** helpers ***********
   */
  getStyleValue() {
    const treeElm = this.$refs.tree as Element;
    this.clientHeight = parseInt(getComputedStyle(treeElm).height);
    this.containerOffsetY = treeElm.getBoundingClientRect().top;
  }
}
</script>
