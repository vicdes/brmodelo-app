export type ModelType = "conceptual" | "logic" | "nosql" | "polyglot";

export enum PolyglotDatabases {
	Relational = "Relational",
	Graphs = "Graphs",
	Document = "Document",
	KeyValue = "Key‑value",
	Columnar = "Columnar",
	RelationalGraphs = "Relational + Graphs",
	RelationalDocument = "Relational + Document",
	RelationalKeyValue = "Relational + Key‑value",
	RelationalColumnar = "Relational + Columnar",
	GraphsDocument = "Graphs + Document",
	GraphsKeyValue = "Graphs + Key‑value",
	GraphsColumnar = "Graphs + Columnar",
	DocumentKeyValue = "Document + Key‑value",
	DocumentColumnar = "Document + Columnar",
	KeyValueColumnar = "Key‑value + Columnar",
}

export const polyglotColors: Record<PolyglotDatabases, string> = {
	[PolyglotDatabases.Relational]: "#E4004C",
	[PolyglotDatabases.Graphs]: "#74E1FF",
	[PolyglotDatabases.Document]: "#48A81D",
	[PolyglotDatabases.KeyValue]: "#FF69B2",
	[PolyglotDatabases.Columnar]: "#FFDA48",
	[PolyglotDatabases.RelationalGraphs]: "#A6A6A6",
	[PolyglotDatabases.RelationalDocument]: "#8B3E1F",
	[PolyglotDatabases.RelationalKeyValue]: "#ffbfc9",
	[PolyglotDatabases.RelationalColumnar]: "#E0FFCC",
	[PolyglotDatabases.GraphsDocument]: "#4A7FFF",
	[PolyglotDatabases.GraphsKeyValue]: "#B533E0",
	[PolyglotDatabases.GraphsColumnar]: "#9BDEA0",
	[PolyglotDatabases.DocumentKeyValue]: "#FF8000",
	[PolyglotDatabases.DocumentColumnar]: "#E5B3FF",
	[PolyglotDatabases.KeyValueColumnar]: "#0A3CA0",
};

export const polyglotFontColor = {
	[PolyglotDatabases.Relational]: "white",
	[PolyglotDatabases.Graphs]: "#202122",
	[PolyglotDatabases.Document]: "white",
	[PolyglotDatabases.KeyValue]: "white",
	[PolyglotDatabases.Columnar]: "#202122",
	[PolyglotDatabases.RelationalGraphs]: "#202122",
	[PolyglotDatabases.RelationalDocument]: "white",
	[PolyglotDatabases.RelationalKeyValue]: "#202122",
	[PolyglotDatabases.RelationalColumnar]: "#202122",
	[PolyglotDatabases.GraphsDocument]: "white",
	[PolyglotDatabases.GraphsKeyValue]: "white",
	[PolyglotDatabases.GraphsColumnar]: "#202122",
	[PolyglotDatabases.DocumentKeyValue]: "white",
	[PolyglotDatabases.DocumentColumnar]: "#202122",
	[PolyglotDatabases.KeyValueColumnar]: "white",
}

export type PolyglotDatabase = {
	id: number,
	name: PolyglotDatabases,
	elementId: string
}

export interface Model {
	_id: string;
	name: string;
	type: ModelType | string;
	model: string;
	created: string;
	updated: string;
	version: number;
	polyglotDatabases?: PolyglotDatabase[];
	polyglotColors?: string[];
}
