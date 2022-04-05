import React from "react";
import NftItem from "../components/NftItem/NftItem";
import { minSize } from '../hooks/useTileSize';
/* 
	props:{
		nfts:array
		tileSize:{
			width:number
			height:number,
			gap:number,
			tilesPerRow:number,
		},
		className:string
	}
*/
export function NftTilesLayout(props)
{
	return(
		<>
		{
			props.nfts &&
			props.nfts.map((nft, index) => {
				const style = {
					width: (props.tileSize != null & parseInt(props.tileSize.width) > 0) ? props.tileSize.width : minSize
				};
				style.margin = ((index + 1) % props.tileSize.tilesPerRow !== 0 && props.tileSize.tilesPerRow > 1)
					? `0 ${props.tileSize.gap}px 0 0`
					: `unset`;
				
				return(
					<div key={nft.Pubkey} style={style} className={`d-flex ${props.className}`}>
						<NftItem {...nft} />
					</div>
				)
			})
		}
		</>
	);
}