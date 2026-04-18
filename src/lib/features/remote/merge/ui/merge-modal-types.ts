export interface PreviewAsset {
	id: string;
	type: string;
}

export interface MergeModalState {
	collaborators: string[];
	selectedAuthors: Set<string>;
	authorCommits: Map<string, any>;
	selectedCommits: Map<string, string[]>;
	selectedEntries: Map<string, Set<string>>;
	isLoading: boolean;
	isMerging: boolean;
	errorMessage: string | null;
	successMessage: string | null;
	mergeResponse: any | null;
	previewAsset: PreviewAsset | null;
	showPreview: boolean;
}
