import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import PageHeader from "@/src/components/ui/PageHeader";
import Card from "@/src/components/ui/Card";

function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof router.query.query === "string") {
      setQuery(router.query.query);
    }
  }, [router.query.query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description={
          query
            ? `Showing results for "${query}".`
            : "Type in the search bar to search across the admin panel."
        }
      />
      <Card>
        <div className="text-sm text-slate-500">
          Global search is wired and receiving your query:
          <span className="ml-1 font-medium text-slate-800 break-all">{query || "—"}</span>
        </div>
      </Card>
    </div>
  );
}

export default withAdminLayout(SearchPage);

