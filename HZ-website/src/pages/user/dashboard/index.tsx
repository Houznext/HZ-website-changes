import { DashboardTable } from "@/common/DashBoardTable";
import withUserLayout from "@/components/Layouts/UserLayout";
import UserDashBoardView from "@/components/UserDashboardView";
import React from "react";

function Dashboard() {
  return <div className="w-full">
    <UserDashBoardView/>

  </div>;
}

export default withUserLayout(Dashboard);
