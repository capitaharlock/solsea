import { useCallback, useEffect, useLayoutEffect, useState } from "react";

export function useTileSize() {
	const [size, setSize] = useState({
		width: 0, 
		height: 0,
		gap: 0,
		tilesPerRow: 0,
	});
	const [node, setNode] = useState(null);

	const ref = useCallback((node) => {
		setNode(node);
	}, []);
	
	// useLayoutEffect(()=>{
	useEffect(()=>{
		const observer = new ResizeObserver(entries => {
			const entry = entries[0];
			if(entry)
			{
				setSize(getTileSize({
					width:entry.contentRect.width,
					height:entry.contentRect.height,
				}));
			}
		});
		if(node)
			observer.observe(node);

		return ()=>{
			observer.disconnect();
		}
	}, [node]);

	return [ref, size];
}

export const minSize = 270;
export const tileGap = 25;

function getTileSize(itemContainerSize){
	let items = 50;
	const result = {
		width:0,
		height:itemContainerSize.height,
		gap:25,
		tilesPerRow:0,
	};
	if(itemContainerSize.width > 0)
	{
		while(true)
		{
			const size = (itemContainerSize.width - ((items -1 ) * tileGap)) / items;
			if(size > minSize)
			{
				result.width = (items === 1) 
				? (size > minSize)
					? '100%'
					: `${minSize}px` 
				: `${size}px`;
				result.tilesPerRow = items;
				break;
			}
			else
				items--;
		}
	}
	return result;
}