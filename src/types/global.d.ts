/// <reference types="vite-plugin-pwa/client" />

export type Elements = {
	generateButton: HTMLButtonElement | null;
	input: HTMLTextAreaElement | null;
	inputTypeGroup: HTMLElement | null;
	resultWrapper: HTMLElement | null;
	result: HTMLElement | null;
	loader: HTMLElement | null;
	outputFormatGroup: HTMLElement | null;
	copyButton: HTMLButtonElement | null;
	copyButtonIcon: SVGUseElement | null;
	downloadButton: HTMLButtonElement | null;
	fileInput: HTMLInputElement | null;
	colorModeButtons: NodeListOf<HTMLButtonElement> | null;
};

export type UUIDMapping = {
	name: string;
	uuid: string;
};

export type MappingResult = {
	promises: Promise<void>[];
	mappings: UUIDMapping[];
};

export type ExportFormat = 'json' | 'txt';
export type ImportType = 'online' | 'offline';

export {};
