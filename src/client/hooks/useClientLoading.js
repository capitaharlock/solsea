import { useState, useEffect } from "react";
//fetchData
export const useClientLoading = ({ load, isInitialRender, params = {} }) => {
  const [isLoading, setLoading] = useState(!isInitialRender);
  useEffect(() => {
    if (!isInitialRender) {
      setLoading(true);
      load(params)
        .then(res => {
          setLoading(false);
        })
        .catch(error => {
          console.log(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [...Object.values(params)]);
  return isLoading;
};
