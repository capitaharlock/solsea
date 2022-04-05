import React, { useMemo } from "react";
import { useHistory } from "react-router";
import client from "../../services/feathers";
import { handleInitialUserData, LOGIN } from "../../actions/user";
import { useDispatch, useSelector } from "react-redux";
import { SET_REDIRECT } from "../../actions/app";

const AutoLogin = () => {
  const history = useHistory();
  const { connected } = useSelector(({ user }) => ({ ...user }));
  const dispatch = useDispatch();

  useMemo(() => {
    if (connected && history.location.pathname !== "/login") {
      client
        .reAuthenticate()
        .then(data => {
          dispatch({
            type: LOGIN,
            payload: data
          });
          dispatch(handleInitialUserData());
        })
        .catch(err => {
          console.log(err);
          if (history.location.pathname !== "/login") {
            dispatch({
              type: SET_REDIRECT,
              payload: history.location.pathname
            });
          }
          history.push("/login");
        });
    }
  }, [connected]);
  return null;
};

export default AutoLogin;
