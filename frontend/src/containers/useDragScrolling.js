import { useRef } from "react";
import { throttle } from "lodash";

const useDragScrolling = () => {
  const isScrolling = useRef(false);

  const goDown = () => {
    document.documentElement.scrollTop += 6;

    const { offsetHeight, scrollTop, scrollHeight } = document.documentElement;
    const isScrollEnd = offsetHeight + scrollTop >= scrollHeight;

    if (isScrolling.current && !isScrollEnd) {
      window.requestAnimationFrame(goDown);
    }
  };

  const goUp = () => {
    document.documentElement.scrollTop -= 6;

    if (isScrolling.current && window.scrollY > 0) {
      console.log("Going up -------", document.documentElement.scrollTop);
      window.requestAnimationFrame(goUp);
    }
  };

  const onDragOver = (event) => {
    const isMouseOnTop = event.clientY < 100;
    const isMouseOnDown = window.innerHeight - event.clientY < 50;

    console.log(
      "Drag event",
      window.scrollY,
      document.documentElement.scrollTop
    );
    if (!isScrolling.current && (isMouseOnTop || isMouseOnDown)) {
      isScrolling.current = true;

      if (isMouseOnTop) {
        window.requestAnimationFrame(goUp);
      }

      if (isMouseOnDown) {
        window.requestAnimationFrame(goDown);
      }
    } else if (!isMouseOnTop && !isMouseOnDown) {
      isScrolling.current = false;
    }
  };

  const throttleOnDragOver = throttle(onDragOver, 300);

  const addEventListenerForWindow = () => {
    window.addEventListener("dragover", throttleOnDragOver, false);
  };

  const removeEventListenerForWindow = () => {
    window.removeEventListener("dragover", throttleOnDragOver, false);
    isScrolling.current = false;
  };

  return {
    addEventListenerForWindow,
    removeEventListenerForWindow
  };
};

export default useDragScrolling;
