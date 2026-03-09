import Button from "@/common/Button";
import Modal from "@/common/Modal";
import { useState, useEffect } from "react";
import Image from "next/image";
import Confetti from "react-confetti";
import { Sparkles } from "lucide-react";

const WelcomeModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const lastShown = localStorage.getItem("welcomeModalShownAt");

        if (!lastShown || (Date.now() - Number(lastShown)) > 24 * 60 * 60 * 1000 * 7) {
            setIsOpen(true);
            localStorage.setItem("welcomeModalShownAt", Date.now().toString());
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    }, []);

    return (
        <div>
            <Modal
                isOpen={isOpen}
                closeModal={() => setIsOpen(false)}
                rootCls="z-[9999]"
                className="max-w-[520px] overflow-hidden rounded-2xl border-0 p-0 shadow-2xl"
                isCloseRequired={false}
            >
                {showConfetti && <Confetti width={typeof window !== "undefined" ? window.innerWidth : 1920} height={typeof window !== "undefined" ? window.innerHeight : 1080} />}
                <div className="relative">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#3586FF] via-blue-400 to-[#3586FF]" />
                    <div className="bg-gradient-to-b from-slate-50 to-white px-6 pt-6 pb-6 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3586FF]/10 px-3 py-1 text-xs font-semibold text-[#3586FF] mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            Your dream home starts here
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                            Welcome to <span className="text-[#3586FF]">OneCasa</span>
                        </h2>
                        <p className="mt-2 text-sm label-text md:text-base text-slate-600 max-w-[300px] mx-auto leading-relaxed">
                            The only platform you need for your dream home.
                        </p>

                        <div className="my-6 flex justify-center">
                            <div className="relative flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-xl bg-white shadow-lg ">
                                <Image
                                    src="/images/logobb.png"
                                    alt="OneCasa"
                                    width={96}
                                    height={96}
                                    className="object-contain p-1.5"
                                />
                            </div>
                        </div>

                        <p className="text-sm sublabel-text text-slate-600 max-w-[320px] mx-auto leading-relaxed">
                            Explore{" "}
                            <span className="font-semibold text-[#3586FF]">property listings</span>
                            ,{" "}
                            <span className="font-semibold text-[#3586FF]">best offers</span>
                            {" "}&{" "}
                            <span className="font-semibold text-[#3586FF]">home solutions</span>
                            {" "}—all in one place.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                            <Button
                                className="order-2 sm:order-1 w-full label-text sm:w-auto px-6 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Learn more
                            </Button>
                            <Button
                                className="order-1 sm:order-2 w-full label-text sm:w-auto px-6 py-2.5 rounded-xl bg-[#3586FF] text-white text-sm font-semibold hover:bg-[#2a6bcc] transition-colors shadow-md shadow-[#3586FF]/25"
                                onClick={() => setIsOpen(false)}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default WelcomeModal;
