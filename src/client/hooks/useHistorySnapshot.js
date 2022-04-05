import { useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { ADD_HISTORY_SNAPSHOT } from "../actions/history";

let historySnapshot = {};
export default function useHistorySnapshot(snapshot, executor = null) {
	const history = useHistory();
	const { historyStore } = useSelector(({ history }) => {
		return { historyStore: history };
	});
	const dispatch = useDispatch();
	const key = useRef(history.location.key);
	historySnapshot[key.current] = { ...snapshot };
	useLayoutEffect(() => {
		if (
			history.action === "POP" &&
			historyStore &&
			historyStore.hasOwnProperty(history.location.key) &&
			executor
		)
			executor({ ...historyStore[history.location.key] });

		return () => {
			dispatch({
				type: ADD_HISTORY_SNAPSHOT,
				payload: {
					key: key.current,
					snapshot: {
						...historySnapshot[key.current],
						scrollY: window.scrollY,
						scrollX: window.scrollX
					}
				}
			});
			delete historySnapshot[key.current];
		};
	}, []);

	return historyStore && historyStore.hasOwnProperty(history.location.key)
		? { ...historyStore[history.location.key] }
		: null;
}
