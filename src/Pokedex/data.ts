/**
 * Type palette and entry data.
 *
 * The colours are transcribed from hungps/flutter_pokedex
 * (`lib/presenter/themes/colors.dart` + `lib/data/entities/pokemon_types.dart`),
 * so the video matches that app's look.
 */

export const TYPE_COLORS = {
	grass: '#78C850',
	poison: '#9F5BBA',
	fire: '#FB6C6C',
	flying: '#A890F0',
	water: '#7AC7FF',
	bug: '#48D0B0',
	normal: '#A8A878',
	electric: '#FFCE4B',
	ground: '#795548',
	fairy: '#F85888',
	fighting: '#FA6555',
	psychic: '#EE99AC',
	rock: '#CA8179',
	steel: '#BABABA',
	ice: '#98D8D8',
	ghost: '#7C538C',
	dragon: '#7038F8',
	dark: '#303943',
} as const;

export type PokemonType = keyof typeof TYPE_COLORS;

export type Stat = {
	label: string;
	value: number;
	/** Stats are drawn against a 150 ceiling, as the reference app does. */
	max?: number;
};

export type Entry = {
	number: number;
	name: string;
	genus: string;
	types: PokemonType[];
	/** File in `public/pokemon/`, resolved with staticFile(). */
	image: string;
	description: string;
	stats: Stat[];
};

export const ENTRIES: Entry[] = [
	{
		number: 1,
		name: 'Bulbasaur',
		genus: 'Seed Pokémon',
		types: ['grass', 'poison'],
		image: 'pokemon/bulbasaur.png',
		description:
			'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
		stats: [
			{label: 'HP', value: 45},
			{label: 'Attack', value: 49},
			{label: 'Defense', value: 49},
			{label: 'Sp. Atk', value: 65},
			{label: 'Speed', value: 45},
		],
	},
	{
		number: 4,
		name: 'Charmander',
		genus: 'Lizard Pokémon',
		types: ['fire'],
		image: 'pokemon/charmander.png',
		description:
			'It has a preference for hot things. When it rains, steam is said to spout from the tip of its tail.',
		stats: [
			{label: 'HP', value: 39},
			{label: 'Attack', value: 52},
			{label: 'Defense', value: 43},
			{label: 'Sp. Atk', value: 60},
			{label: 'Speed', value: 65},
		],
	},
	{
		number: 7,
		name: 'Squirtle',
		genus: 'Tiny Turtle Pokémon',
		types: ['water'],
		image: 'pokemon/squirtle.png',
		description:
			'When it retracts its long neck into its shell, it squirts out water with vigorous force.',
		stats: [
			{label: 'HP', value: 44},
			{label: 'Attack', value: 48},
			{label: 'Defense', value: 65},
			{label: 'Sp. Atk', value: 50},
			{label: 'Speed', value: 43},
		],
	},
];

export const STAT_MAX = 150;

/** The reference app tints the whole screen with the primary type's colour. */
export const primaryColor = (entry: Entry) => TYPE_COLORS[entry.types[0]];

export const FONT_STACK =
	'"Segoe UI", Inter, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
