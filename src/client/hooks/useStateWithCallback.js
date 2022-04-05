import React, {useState, useEffect} from 'react';
export function useStateWithCallback(initialState, callback)
{
    const [state, setState] = useState(initialState);
    useEffect(()=>{
        callback?.(state);
    }, [state, setState]);
    return [state, setState];
}