import Button from '@/common/Button'
import CustomInput from '@/common/FormElements/CustomInput'
import FloatingInput from '@/common/FormElements/FloatingInput'
import Loader from '@/components/Loader'
import usePostPropertyStore from '@/store/postproperty'
import { usePropertyStore } from '@/store/propertyStore'
import apiClient from '@/utils/apiClient'
import { LockIcon } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'


const VerifyStep = () => {
    const [otp, setOtp] = useState<string[]>(new Array(4).fill(''))
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const router = useRouter()
    const { email, phone } = usePostPropertyStore((state) => state.basicDetails!);
    const resetState = usePostPropertyStore((state) => state.resetState);
    const basicDetails = usePostPropertyStore(state => state.basicDetails);
    const setProperty = usePostPropertyStore(state => state.setProperty);

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };


    const handleSubmit = async (event: any) => {
        event.preventDefault();

        const otpValue = otp.join("");
        const identifier = email || phone;
        const payload: { email?: string; phone?: string } = {};
        if (email) payload.email = email;
        if (phone) payload.phone = phone;

        setLoading(true);
        try {
            const userResponse = await apiClient.post(
                `${apiClient.URLS.otp}/check-user`,
                payload
            );

            if (!userResponse.body?.status) {
                toast.error("Please create an account first");
                router.push("/signup?redirect=/post-property/details");
                return;
            }

            await signIn("otp-login", {
                redirect: true,
                identifier,
                otp: otpValue,
                callbackUrl: "/post-property/details",
            });
            return;

        } catch (error) {
            console.error("Error in OTP verification:", error);
            toast.error("Something went wrong during verification.");
            setLoading(false);
        }
    };


    const handlePassword = async (event: any) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const identifier = email || phone;

        const authPayload: { email?: string; phone?: string; password: string } = {
            password,
        };

        if (email) authPayload.email = email;
        if (phone) authPayload.phone = phone;

        const checkPayload: { email?: string; phone?: string } = {};
        if (email) checkPayload.email = email;
        if (phone) checkPayload.phone = phone;

        try {
            const userResponse = await apiClient.post(
                `${apiClient.URLS.otp}/check-user`,
                checkPayload
            );

            if (!userResponse.body?.status) {
                toast.error("Please create an account first");
                router.push("/signup?redirect=/post-property/details");
                return;
            }

            const result = await signIn("email-login", {
                redirect: false,
                identifier,
                password,
            });

            if (result?.ok) {
                toast.success("Login successful!");
                router.push("/post-property/details");
            } else {
                setError("Invalid credentials");
                toast.error("Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong");
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />

    return (
        <div className='flex flex-col items-center max-w-[440px] rounded-md shadow-md bg-white p-10 justify-start min-h-full gap-10'>
            <p className='text-[18px] font-medium '>Enter Any 4 digit OTP or Password to login</p>
            <div>
                <div className="flex flex-col ">
                    <label className="text-[14px] text-start font-medium mb-2">Enter OTP</label>
                    <div className="flex flex-row gap-3 mb-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el) as any}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="text-base border rounded-[6px] border-[#A8A9B0] bg-[#F3F3F3] focus-within:bg-white md:min-h-[45px] max-w-[50px] text-center"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button
                        type="submit"
                        className="flex w-[355px] h-[45px] mt-10 rounded-[8px] bg-[#3586FF] items-center font-medium justify-center font-500 text-[16px] leading-[20.5px] text-[#FFFFFF]"
                        onClick={handleSubmit}
                    >
                        Verify OTP
                    </Button>
                </div>
            </div>
            <div className='w-full flex flex-row items-center'>
                <div className='flex-grow h-px bg-gray-300'></div>
                <p className='mx-3 text-[18px] font-medium text-gray-600'>or</p>
                <div className='flex-grow h-px bg-gray-300'></div>
            </div>

            <div>
                <CustomInput
                    name={'password'}
                    labelCls='text-[14px] font-medium mb-2'
                    required
                    type={'text'}
                    label="Enter Password"
                    placeholder='Enter Password'
                    className='py-1 text-[14px]'
                    value={password}
                    leftIcon={<LockIcon />}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className='mt-5'>
                    <Button
                        type="submit"
                        className="flex w-[355px] h-[45px] rounded-[8px] bg-[#3586FF] items-center font-medium justify-center font-500 text-[16px] leading-[20.5px] text-[#FFFFFF]"
                        onClick={handlePassword}
                    >
                        Submit Password
                    </Button>
                </div>
            </div>
        </div>
    )
}
export default VerifyStep