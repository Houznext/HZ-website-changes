import React from "react";
import { FaShoppingCart, FaArrowRight } from "react-icons/fa";
import Button from "@/common/Button";
import { useRouter } from "next/router";
import { MdExplore } from "react-icons/md";


interface EmptyCart {
    title?: string
}
const EmptyCart = ({ title }: EmptyCart) => {
    const router = useRouter();

    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-md p-6 md:p-8 text-center flex flex-col items-center justify-center">
                <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600">
                    <FaShoppingCart className="text-2xl" />
                </div>
                <h2 className="heading-text font-bold text-gray-900">
                    {title}
                </h2>
                <p className="mt-2 md:text-[12px] text-[10px] font-medium text-gray-500">
                    Looks like you haven’t added anything yet.
                    <br />
                    Explore our products and services to get started.
                </p>
                <div className="mt-4 label-text text-[#3586FF] font-medium">
                    OneCasa • One stop solution for all your home needs
                </div>
                <div className="mt-6 flex flex-col items-center justify-center w-full  mx-auto gap-3">
                    <Button
                        onClick={() => router.push("/")}
                        className="w-full max-w-[200px] bg-blue-500 hover:bg-blue-500 py-1 label-text rounded-[4px] text-white  px-10 text-nowrap flex items-center justify-center gap-2"
                    >
                        Browse Products
                        <FaArrowRight className="text-[12px]" />
                    </Button>

                    <Button
                        onClick={() => router.push("/properties")}
                        className="text-sm text-gray-600 hover:text-blue-500 borderflex flex items-center justify-center gap-2 border border-blue-400 hover:border-blue-400 py-1 px-3 label-text rounded-[4px] transition"
                    >
                        Explore Products <MdExplore className="text-[12px]" />
                    </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                    <span>🔒 Secure Checkout</span>
                    <span>•</span>
                    <span>Trusted By 10000+ customers</span>
                </div>
            </div>
        </div>
    );
};

export default EmptyCart;
