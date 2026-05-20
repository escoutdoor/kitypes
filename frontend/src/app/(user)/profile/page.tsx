import Profile from "@/components/features/profile/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Особистий кабінет",
    description: "Управління вашим профілем на KityPes",
};

export default function ProfilePage() {
    return <Profile />
}
