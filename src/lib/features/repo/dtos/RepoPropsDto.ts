import BaseDTO from "$lib/utils/models/BaseDTO.svelte";

export type RepoPropsPayload = {
    name: string;
    ownerName: string;
    ownerAvatarUrl?: string;
    description: string;
    private: boolean;
    size: number;
    collaborators: {avatarUrl: string, name: string}[];
    createdAt: Date;
    url: string;
}

export default class RepoPropsDto extends BaseDTO<RepoPropsPayload> {}