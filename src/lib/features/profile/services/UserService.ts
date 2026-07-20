import { Mockable } from "$lib/utils/mock/Mockable";
import type { AxiosInstance } from "axios";
import UserProfileResponse from "../dtos/UserProfileResponse";
import type { UserProfilePayload } from "../dtos/UserProfileResponse";

export default class UserService extends Mockable {
    private api : AxiosInstance;

    constructor(api : AxiosInstance) {
        super();
        this.api = api;
    }

    async getProfileByUsername(username : string) : Promise<UserProfileResponse> {
        const userResponse = new UserProfileResponse();

        const resp = await this.api.get<UserProfilePayload>(`/user/profile/${username}`);
        if (!resp.data) {
            userResponse.setError(Error());
        }

        userResponse.setPayload(resp.data);

        return userResponse;
    }

    async mock_getProfileByUsername(user: string) : Promise<UserProfileResponse> {
        const resp = new UserProfileResponse();
        resp.setPayload({
            fullName: "Saif Star",
            username: "starsaif",
            regionCode: "EG",
            phoneNumber: "123-456-7890",
            birthDate: null,
            avatarUrl: "https://res.cloudinary.com/dyzxhzd5h/image/upload/q_auto/f_auto/v1778804360/OUR_CEO_u9agfa.png",
            bio: "The CEO of Star Plus Games",
            twitterUrl: "https://twitter.com/starsaif",
            linkedinUrl: "https://www.linkedin.com/company/star-plus-games",
            websiteUrl: "https://saifstar.vercel.app",
            followers: 0,
            following: 0
        });

        return resp;
    }
}