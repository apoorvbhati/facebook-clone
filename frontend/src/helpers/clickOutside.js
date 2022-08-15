import { useEffect } from "react";

// This functon is a react hook that is used to stop an element from rendering when a user clicked outside of the element
// The ref is the reference to that element and fun is the function that runs when there is a mousedown or touchstart event
const useClickOutside = (ref, fun) => {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) {
        return;
      }
      fun();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // cleanup
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref]);
};

export default useClickOutside;
