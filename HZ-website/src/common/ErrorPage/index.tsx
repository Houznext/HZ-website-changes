import Link from "next/link";
import { useRouter } from "next/router";
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";
import Button from "../Button";

const Custom404 = () => {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex  items-center justify-start flex-1">
                <div className="max-w-6xl mx-auto md:px-4 px-2 md:py-10 py-2 w-full">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="p-8 md:p-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#3586FF] text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-[#3586FF]" />
                                    Page not found
                                </div>

                                <h1 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
                                    404
                                </h1>

                                <p className="mt-3 text-gray-600 label-text font-regular">
                                    The page you’re looking for doesn’t exist or may have been moved.
                                    Let’s get you back to something useful.
                                </p>

                                <div className="mt-6">
                                    <p className="text-xs text-gray-500 mt-2">
                                        Press Enter to explore Properties
                                    </p>
                                </div>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Button
                                        onClick={() => router.back()}
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded-md btn-text border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        <FiArrowLeft />
                                        Go back
                                    </Button>

                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-5 py-2 btn-text rounded-md bg-[#3586FF] text-white hover:opacity-95 font-medium"
                                    >
                                        <FiHome />
                                        Home
                                    </Link>

                                    <Link
                                        href="/properties"
                                        className="inline-flex items-center gap-2 px-5 py-2 btn-text rounded-md bg-gray-900 text-white hover:opacity-95 font-medium"
                                    >
                                        Browse Properties
                                    </Link>
                                </div>

                                <div className="mt-10">
                                    <p className="subheading font-medium text-gray-900">
                                        Quick links:
                                    </p>
                                    <div className=" flex flex-wrap gap-x-6 gap-y-2 label-text">
                                        <Link href="/services" className="text-[#3586FF] hover:underline">
                                            Services
                                        </Link>
                                        <Link href="/custom-builder" className="text-[#3586FF] hover:underline">
                                            Custom Builder
                                        </Link>
                                        <Link href="/blogs" className="text-[#3586FF] hover:underline">
                                            Blogs
                                        </Link>
                                        <Link href="/contact-us" className="text-[#3586FF] hover:underline">
                                            Contact Us
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#0b1b33] to-[#102a4e] p-8 md:p-12 text-white flex flex-col justify-between">
                                <div>
                                    <p className="text-white/80 font-medium">
                                        Tip
                                    </p>
                                    <h2 className="mt-2 md:text-xl text-[14px] font-bold">
                                        Check the URL or return to your dashboard
                                    </h2>
                                    <p className="text-white/70 sublabel-text font-regular">
                                        If you were trying to open a protected page, please login again.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3">
                                        <Link
                                            href="/login"
                                            className="w-full text-center px-5 py-2 btn-text rounded-md bg-white text-gray-900 font-medium hover:bg-white/95"
                                        >
                                            Go to Login
                                        </Link>
                                        <Link
                                            href="/user/dashboard"
                                            className="w-full text-center px-5 py-2 btn-text rounded-md border border-white/30 text-white font-medium hover:bg-white/10"
                                        >
                                            Client Dashboard
                                        </Link>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/15 text-xs text-white/60 font-regular">
                                    © {new Date().getFullYear()} ONE CASA • One Roof Every Solution
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Custom404
