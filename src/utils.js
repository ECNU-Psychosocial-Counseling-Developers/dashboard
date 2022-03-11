function debounce(callback, delay) {
  let delayId = null;
  return function (...args) {
    if (delayId !== null) {
      // 已经有一个定时器在跑了
      clearTimeout(delayId);
    }
    delayId = setTimeout(() => {
      callback.apply(this, args);
      delayId = null;
    }, delay);
  }
}
export { debounce };
