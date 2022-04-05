import { useMemo, useState } from "react";
import { CONTENT_URL } from "../../api/Definitions";

export function useFilePath({ destination }) {
  const [path, setPath] = useState("");

  useMemo(() => {
    if (destination) {
      setPath(CONTENT_URL + destination);
    } else {
      setPath("");
    }
  }, [destination]);

  return { path };
}
