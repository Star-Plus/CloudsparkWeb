import Response, { ResponseState } from "$lib/utils/models/Response";

export type UserProfilePayload = {
    fullName: string;
    username: string;
    regionCode: string;
    phoneNumber: string;
    birthDate: string | null;
    avatarUrl: string | null;
    bio: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    followers: number;
    following: number;
}

export default class UserProfileResponse extends Response<UserProfilePayload> {}