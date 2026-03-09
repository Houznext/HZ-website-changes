import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ShieldX,
  ArrowLeft,
  LayoutDashboard,
  Mail,
  LockKeyhole,
} from "lucide-react";
import Button from "../Button";

type Props = {
  resource: string;
  contactEmail?: string;
  requestAccessUrl?: string;
};

export default function AccessDenied({
  resource,
  contactEmail,
  requestAccessUrl,
}: Props) {
  const router = useRouter();

  return (
    <div className="w-full h-full">
      <div className="w-full  flex items-start h-full md:items-center justify-center px-3 md:px-6 py-8">
        <div className="w-full max-w-[480px]">
          <div className="rounded-md border border-red-100 bg-gradient-to-br from-red-50 via-white to-white shadow-sm">
            <div className="p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 w-fit rounded-2xl border border-red-100 bg-white p-3 shadow-sm">
                <ShieldX className="h-7 w-7 text-red-600" />
              </div>
              <p className="text-[14px] md:text-[16px] font-bold text-red-600">
                Access Restricted
              </p>

              <h1 className="mt-2 text-[18px] md:text-[24px] font-bold text-gray-900">
                You don’t have access
              </h1>

              <p className="mt-2 text-[12px] md:text-[13px] font-regular text-gray-600">
                Your role doesn’t have the required permission
              </p>

              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
                  <LockKeyhole className="h-4 w-4 text-gray-500" />
                  <span className="text-[11px] font-medium text-gray-700">
                    {resource}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-1 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back
                </Button>

                {requestAccessUrl ? (
                  <Link
                    href={requestAccessUrl}
                    className="inline-flex items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-4 py-2 text-[13px] font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Request access
                  </Link>
                ) : null}

                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}?subject=Access Request: ${encodeURIComponent(
                      resource
                    )}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-1 text-[13px] font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    Contact admin
                  </a>  
                ) : null}

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#5297ff] px-4 py-1 text-[13px] font-medium text-white hover:bg-blue-600"
                >
                  <LayoutDashboard className="h-3 w-3" />
                  Dashboard
                </Link>
              </div>

              <p className="mt-5 text-[12px] text-gray-500 font-regular">
                Tip: Ask your SuperAdmin to enable this permission in your role
                configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
