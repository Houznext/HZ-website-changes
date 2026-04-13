import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import PhasesView from "@/components/LivebuildComponent/PhasesView";
import SEO from "@/components/SEO";

const PhasesPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Project Phases | LiveBuild | Houznext"
        description="View and track construction phases, timelines, and budget for your LiveBuild project."
        keywords="Construction Phases, Project Timeline, Phase Tracking, Houznext Builder"
      />
      <PhasesView />
    </div>
  );
};

export default withUserLayout(PhasesPage);
