// 食事データが変わったことをアプリ内に知らせる仕組み。
// どこで保存しても（ヘッダーのモーダルなど）、表示中の画面の useMeals が再取得できるようにする
const target = new EventTarget();
const MEALS_CHANGED = "meals-changed";

export const notifyMealsChanged = () => {
  target.dispatchEvent(new Event(MEALS_CHANGED));
};

// 購読を解除する関数を返す（useEffect のクリーンアップにそのまま使える）
export const subscribeMealsChanged = (listener: () => void) => {
  target.addEventListener(MEALS_CHANGED, listener);
  return () => target.removeEventListener(MEALS_CHANGED, listener);
};
