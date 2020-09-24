import { mount } from '@vue/test-utils';


import MassTree from '../src/index.vue';
// 编写 MassTree 的测试用例
describe('MassTree组件', () => {
  it('MassTree Mount', () => {
    const wrapper = mount(MassTree);
    expect(wrapper.exists()).toBe(true);
  });
});
    