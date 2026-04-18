import BlobStorage from "$lib/features/cloudStorage/BlobStorage";
import FileService from "$lib/features/cloudStorage/FileService";
import CanvasToWebP from "$lib/utils/CanvasToWebP";
import type CreateProfileRequest from "./dtos/CreateProfileRequest";

export default class ProfileProcessor {

    private currentStep: number = -1;

    private profileData = {
        fullName: "",
        regionCode: 0,
        phoneNumber: "",
        birthDate: "",
        avatarUrl: ""
    };

    private static instance: ProfileProcessor;
    private constructor() {
        this.currentStep = localStorage.getItem("profileCreationStep") 
        ? parseInt(localStorage.getItem("profileCreationStep") as string) : -1;
        
        const savedData = localStorage.getItem("profileCreationData");
        if (savedData) {
            this.profileData = JSON.parse(savedData);
        }
    }

    public static getInstance(): ProfileProcessor {
        if (!ProfileProcessor.instance) {
            ProfileProcessor.instance = new ProfileProcessor();
        }
        return ProfileProcessor.instance;
    }

    public getCurrentStep(): number {
        return this.currentStep;
    }

    public setCurrentStep(step: number): void {
        this.currentStep = step;
        localStorage.setItem("profileCreationStep", step.toString());
    }

    public saveProfileData(data: Partial<{
        fullName: string;
        regionCode: number;
        phoneNumber: string;
        birthDate: string;
        avatarUrl: string;
    }>): void {
        this.profileData = { ...this.profileData, ...data };
        localStorage.setItem("profileCreationData", JSON.stringify(this.profileData));
    }

    public getProfileData(): {
        fullName?: string;
        regionCode?: number;
        phoneNumber?: string;
        birthDate?: string;
        avatarUrl?: string;
    } {
        return this.profileData;
    }

    public clear(): void {
        this.currentStep = -1;
        this.profileData = {
            fullName: "",
            regionCode: 0,
            phoneNumber: "",
            birthDate: "",
            avatarUrl: ""
        };
        localStorage.removeItem("profileCreationStep");
        localStorage.removeItem("profileCreationData");
    }

    public async getFinalProfileData(): Promise<CreateProfileRequest> {
        try {
            const requestData = this.getProfileData();
            

            const webpAvatarUrl = await CanvasToWebP.convert(requestData.avatarUrl!);

            const uploadUrlResponse = await BlobStorage.getUploadUrl(requestData.fullName! + '_avatar.webp');
            await FileService.uploadFile(uploadUrlResponse.presignedUrl, await (await fetch(webpAvatarUrl)).blob(), 'image/webp');

            const avatarUrl = uploadUrlResponse.fileUrl;
            
            const data = {
                fullName: requestData.fullName!,
                regionCode: requestData.regionCode!,
                phoneNumber: requestData.phoneNumber!,
                birthDate: requestData.birthDate!,
                avatarUrl: avatarUrl
            }

            return data as CreateProfileRequest;
        }
        catch (error) {
            throw error;
        }
    }

}