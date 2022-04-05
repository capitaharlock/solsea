import { useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useStateWithCallback } from "../../hooks/useStateWithCallback";

export default function ScrollToTop({ children, excludePath }) {
  const [renderCount, setRenderCount] = useStateWithCallback(0, () => {
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      // console.timeEnd("Scrolling");
    });
  });
  const { pathname } = useLocation();
  const { action } = useHistory();
  const exclude = () => {
    if (excludePath) {
      for (let i = 0; i < excludePath.length; i++) {
        if (
          excludePath[i].path === pathname &&
          excludePath[i].action === action ||
		  action === "POP"
        )
          return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!exclude()) {
      // console.time("Scrolling");
      setRenderCount(renderCount + 1);
    }
  }, [pathname]);

  return children;
}
