import React from 'react';
import type {PokemonType} from '../data';

/** The translucent white pill the reference app uses for type labels. */
export const TypeChip: React.FC<{type: PokemonType; fontSize?: number}> = ({
	type,
	fontSize = 26,
}) => (
	<div
		style={{
			padding: `${fontSize * 0.42}px ${fontSize * 1.05}px`,
			borderRadius: 999,
			backgroundColor: 'rgba(255, 255, 255, 0.25)',
			color: 'white',
			fontSize,
			fontWeight: 600,
			letterSpacing: 0.6,
			textTransform: 'capitalize',
			whiteSpace: 'nowrap',
		}}
	>
		{type}
	</div>
);
