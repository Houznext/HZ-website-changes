import { useRouter } from "next/router";
import Button from "@/src/common/Button";
import useCustomBuilderStore from "@/src/stores/custom-builder";

const cap = (v?: string) =>
  (v || "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const StepNavigationHeader = ({ builderId }: { builderId: string }) => {
  const router = useRouter();
  const currentPath = router.asPath || "";
  const { customerOnboarding } = useCustomBuilderStore();
  const { contactDetails } = customerOnboarding || {};
  const first = cap(contactDetails?.first_name);
  const last = cap(contactDetails?.last_name);
  const fullName = [first, last].filter(Boolean).join(" ") || "Customer";

  const initials =
    (contactDetails?.first_name?.[0]?.toUpperCase() || "") +
    (contactDetails?.last_name?.[0]?.toUpperCase() || "") || "OC";

  const isActive = (path: string) => currentPath.includes(path);

  const handleRoute = (path: string) => {
    router.push(`/custom-builder/${builderId}/${path}`);
  };

  const tabs = [
    { key: "customer-onboarding", label: "Onboarding" },
    { key: "document-upload", label: "Documents" },
    { key: "workprogress", label: "Day Progress" },
    { key: "materials", label: "Materials" },
    { key: "payments", label: "Payments" },
  ];

  return (
    <>
      <div className="mb-5 flex items-center gap-3 mt-4">
        <div className="h-8 w-8 rounded-[6px] bg-blue-100 text-blue-700 grid place-items-center font-bold text-sm">
          {initials}
        </div>
        <p className="md:text-[16px] text-[12px] font-medium">
          You&apos;re viewing{" "}
          <span className="font-bold text-[#347ae4]">{last + first}</span>
          &apos;s construction details
        </p>
      </div>

      <div className="border-b pb-4">
        <div className="inline-flex rounded-[6px] gap-1 bg-white border border-gray-200 p-1">
          {tabs.map((t) => (
            <Button
              key={t.key}
              onClick={() => handleRoute(t.key)}
              className={[
                "relative md:px-4 px-2 py-[6px] rounded-[6px] text-nowrap bg-gray-50 shadow-custom border-[1px] font-medium",
                "md:text-[14px] text-[12px] transition-all duration-150",
                isActive(t.key)
                  ? "bg-[#5297FF] text-white shadow-sm"
                  : "text-gray-700 hover:bg-white"
              ].join(" ")}
            >
              {isActive(t.key) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#5297FF] md:hidden" />
              )}
              {t.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StepNavigationHeader;
