import { ADD_HISTORY_SNAPSHOT, REMOVE_HISTORY_SNAPSHOT, CLEAR_HISTORY_SNAPSHOT } from "../actions/history";

const initialState = {};

// payload = {
// 	key:string,
// 	snapshot:[
// 		{
// 			value:?,
// 			setter:function
// 		}
// 	]
// }

export default (state = initialState, action) => {
	const prevState = {...state};
	switch (action.type) {
		case ADD_HISTORY_SNAPSHOT:
			prevState[action.payload.key] = action.payload;
			return prevState;
		case REMOVE_HISTORY_SNAPSHOT:
			if(prevState.hasOwnProperty(action.payload.key))
				delete prevState[action.payload.key];
			return prevState;
		case CLEAR_HISTORY_SNAPSHOT:
			return {};
		default:
			return state;
	}
};
