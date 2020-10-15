import { isArray as _isArray } from "lodash";

class EventEmitter {
  handlers!: { [key: string]: any };

  constructor() {
    this.handlers = {};
  }

  on(eventName: string, fn: Function) {
    if (!_isArray(this.handlers[eventName])) {
      this.handlers[eventName] = [];
    }

    this.handlers[eventName].push(fn);
  }

  emit(eventName: string, ...args: any[]) {
    if (this.handlers[eventName]) {
      this.handlers[eventName].forEach((fn: Function) => {
        fn(...args);
      });
    }
  }
}

export default EventEmitter;
