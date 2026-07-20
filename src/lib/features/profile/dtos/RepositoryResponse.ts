import DTO from "$lib/utils/models/BaseDTO.svelte";

export type RepositoryPayload = {
    id: string;
    name: string;
    public: boolean;
    sizeGB: number;
    collaborators?: string[];
    createdAt: Date;
}

export default class RepositoryDTO extends DTO<RepositoryPayload[]> {}