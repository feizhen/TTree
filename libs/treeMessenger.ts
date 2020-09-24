import { Vue } from "vue-property-decorator";
import Vuex from "vuex";

type MessageType = "update-statistics" | "update-highlight" | "clear-select";

export interface Message {
  type: MessageType | string;
  content?: any;
}

// ! Vue version > 2.6.0
// export const messager: { message: Message } = Vue.observable({
//   message: { type: "", content: {} }
// });

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    message: {}
  },
  getters: {
    getMessage: state => state.message
  },
  mutations: {
    setMessage: (state, val) => (state.message = val)
  }
});

const Messenger = {
  notify(newMessage: Message) {
    // messager.message = newMessage;
    store.commit("setMessage", newMessage);
  }
};

export default Messenger;
