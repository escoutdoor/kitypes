import ProfileSettings from "@/components/features/profile-settings/profile-settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Налаштування профілю",
    description: "Зміна паролю, пошти та інших налаштувань акаунту",
};

export default function ProfileSettingsPage() {
    return <ProfileSettings />
}
