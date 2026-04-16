import { writable, derived, get } from 'svelte/store';
import type { MergeModalState } from './merge-modal-types';
import CollaborationService from '$lib/features/collaboration/services/CollaborationService';
import CommitService from '$lib/features/remote/commits/CommitService';
import type AuthorCommitResponse from '$lib/features/remote/commits/dtos/AuthorCommitResponse';

// Author color palette for visual identity
const AUTHOR_COLORS = [
	'#ffffff', // pure white
	'#e5e5e5', // light grey
	'#a3a3a3', // neutral grey
	'#737373', // medium grey
	'#525252', // dark grey
	'#404040', // deep charcoal
	'#262626', // almost black
	'#ffffff', // repeat white
];

function getAuthorColor(author: string, index: number): string {
	return AUTHOR_COLORS[index % AUTHOR_COLORS.length];
}

function getAuthorInitials(author: string): string {
	const parts = author.split(/[@._\s-]/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return author.slice(0, 2).toUpperCase();
}

function createMergeModalStore() {
	const initialState: MergeModalState = {
		collaborators: [],
		selectedAuthors: new Set(),
		authorCommits: new Map(),
		selectedCommits: new Map(),
		selectedEntries: new Map(),
		isLoading: false,
		isMerging: false,
		errorMessage: null,
		successMessage: null,
		mergeResponse: null,
		previewAsset: null,
		showPreview: false,
	};

	const { subscribe, set, update } = writable<MergeModalState>(initialState);

	return {
		subscribe,

		async loadCollaborators(remoteId: string) {
			update(state => ({ ...state, isLoading: true, errorMessage: null }));

			try {
				const collaborators = await CollaborationService.listCollaborators(remoteId);
				update(state => ({ 
					...state, 
					collaborators,
					isLoading: false 
				}));
			} catch (error) {
				console.error('Failed to load collaborators', error);
				update(state => ({ 
					...state, 
					isLoading: false,
					errorMessage: 'Failed to load collaborators. Please try again.' 
				}));
			}
		},

		async loadCommitsForAuthor(author: string, remoteId: string) {
			try {
				const commits = await CommitService.getAuthorCommits(author, remoteId);
				update(state => {
					const newAuthorCommits = new Map(state.authorCommits);
					newAuthorCommits.set(author, commits);
					
					const newSelectedCommits = new Map(state.selectedCommits);
					if (!newSelectedCommits.has(author)) {
						newSelectedCommits.set(author, []);
					}

					return {
						...state,
						authorCommits: newAuthorCommits,
						selectedCommits: newSelectedCommits
					};
				});
			} catch (error) {
				console.error(`Failed to load commits for ${author}`, error);
				update(state => ({ 
					...state, 
					errorMessage: `Failed to load commits for ${author}.` 
				}));
			}
		},

		toggleAuthorSelection(author: string, remoteId: string) {
			update(state => {
				const newSelectedAuthors = new Set(state.selectedAuthors);
				const newSelectedCommits = new Map(state.selectedCommits);
				const newSelectedEntries = new Map(state.selectedEntries);

				if (newSelectedAuthors.has(author)) {
					newSelectedAuthors.delete(author);
					newSelectedCommits.delete(author);
					newSelectedEntries.forEach((entries) => entries.clear());
				} else {
					newSelectedAuthors.add(author);
					newSelectedCommits.set(author, []);
				}

				return {
					...state,
					selectedAuthors: newSelectedAuthors,
					selectedCommits: newSelectedCommits,
					selectedEntries: newSelectedEntries
				};
			});

			const currentState = get({ subscribe });
			if (currentState.selectedAuthors.has(author)) {
				this.loadCommitsForAuthor(author, remoteId);
			}
		},

		toggleCommitSelection(author: string, commitHash: string) {
			update(state => {
				const newSelectedCommits = new Map(state.selectedCommits);
				const commits = newSelectedCommits.get(author) || [];
				
				if (commits.includes(commitHash)) {
					commits.splice(commits.indexOf(commitHash), 1);
					const newSelectedEntries = new Map(state.selectedEntries);
					newSelectedEntries.delete(commitHash);
					
					return {
						...state,
						selectedCommits: newSelectedCommits,
						selectedEntries: newSelectedEntries
					};
				} else {
					commits.push(commitHash);
					newSelectedCommits.set(author, commits);
					
					return {
						...state,
						selectedCommits: newSelectedCommits
					};
				}
			});
		},

		toggleEntrySelection(commitHash: string, entryName: string) {
			update(state => {
				const newSelectedEntries = new Map(state.selectedEntries);
				let entries = newSelectedEntries.get(commitHash);
				
				if (!entries) {
					entries = new Set();
					newSelectedEntries.set(commitHash, entries);
				}

				if (entries.has(entryName)) {
					entries.delete(entryName);
				} else {
					entries.add(entryName);
				}

				return {
					...state,
					selectedEntries: newSelectedEntries
				};
			});
		},

		setIsMerging(isMerging: boolean) {
			update(state => ({ ...state, isMerging }));
		},

		setErrorMessage(errorMessage: string | null) {
			update(state => ({ ...state, errorMessage }));
		},

		setSuccessMessage(successMessage: string | null) {
			update(state => ({ ...state, successMessage }));
		},

		setMergeResponse(mergeResponse: any) {
			update(state => ({ ...state, mergeResponse }));
		},

		openPreview(entryHash: string, entryName?: string) {
			const fileExtension = entryName ? entryName.split('.').pop() : null;
			update(state => ({
				...state,
				previewAsset: { 
					id: entryHash, 
					type: entryName || fileExtension || 'unknown' 
				},
				showPreview: true
			}));
		},

		closePreview() {
			update(state => ({
				...state,
				showPreview: false,
				previewAsset: null
			}));
		},

		reset() {
			set(initialState);
		},

		// Helper methods for UI
		getAuthorColor(author: string): string {
			const index = get({ subscribe }).collaborators.indexOf(author);
			return getAuthorColor(author, index);
		},

		getAuthorInitials(author: string): string {
			return getAuthorInitials(author);
		},

		getProgress(): { selected: number; total: number; percentage: number } {
			const state = get({ subscribe });
			const totalCommits = Array.from(state.authorCommits.values()).reduce(
				(sum, data) => sum + (data?.commits?.length || 0),
				0
			);
			const selectedCount = Array.from(state.selectedCommits.values()).reduce(
				(sum, commits) => sum + commits.length,
				0
			);
			return {
				selected: selectedCount,
				total: totalCommits,
				percentage: totalCommits > 0 ? (selectedCount / totalCommits) * 100 : 0
			};
		},

		getTotalFileCount(): number {
			const state = get({ subscribe });
			let count = 0;
			state.selectedAuthors.forEach(author => {
				const commits = state.selectedCommits.get(author) || [];
				commits.forEach(commitHash => {
					const commit = state.authorCommits.get(author)?.commits.find((c: any) => c.hash === commitHash);
					if (commit?.tree?.entries) {
						count += commit.tree.entries.length;
					}
				});
			});
			return count;
		}
	};
}

export const mergeModalStore = createMergeModalStore();
