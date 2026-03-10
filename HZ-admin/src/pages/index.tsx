import withAdminLayout from "../common/AdminLayout";
import Loader from "../common/Loader";
import { SEO } from "../common/SEO";
import { useSession } from "next-auth/react";

function Home() {
  const { data: session, status } = useSession();
  const userName = session?.user?.firstName;
  if (status === "loading") return <div className='flex items-center justify-center w-full'><Loader /></div>;

  return (
    <div className="w-full">
      <SEO
        title="Houznext Admin - Premium Interior Living"
        description="Houznext admin dashboard. Manage interior projects, CRM, cost estimator, and referrals."
        keywords="Houznext, admin, interior design, cost estimator, CRM"
        favicon="/images/houznext-logo.png"
      />

      <div className="p-6 md:px-10 md:py-10 space-y-4">
        <h1 className="heading-text">
          Hi! {userName?.charAt(0).toUpperCase() + userName?.slice(1)} 👋
        </h1>
        <p className="text-gray-600 label-text">
          Your contributions are building <span className="font-semibold text-[#2f80ed]">Houznext</span> — premium interior living.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {session?.lastLogin && (
            <p className="text-sm text-gray-500">
              Last Login: {new Date(session.lastLogin * 1000).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAdminLayout(Home);
