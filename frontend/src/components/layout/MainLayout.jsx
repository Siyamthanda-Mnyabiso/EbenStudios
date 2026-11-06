import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import AdminBar from "./AdminBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { isSupabaseConfigured, NOT_CONFIGURED_MESSAGE } from "../../service/supabase";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            {!isSupabaseConfigured && (
                <p role="alert" className="bg-danger text-white text-center font-bold px-4 py-3">
                    {NOT_CONFIGURED_MESSAGE}
                </p>
            )}
            <AdminBar />
            <AnnouncementBar />
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
