export interface IApplicationUser {
    id: string;
    fullName: string;
    profileImageUrl?: string;
    address?: string;
    isVerified: boolean;
    isDeleted: boolean;
    sellerRating?: number;
}
