import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import PhasesView from "@/components/CustomBuilder/PhasesView";
import SEO from "@/components/SEO";

const PhasesPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Project Phases | Custom Builder | OneCasa"
        description="View and track construction phases, timelines, and budget for your custom builder project."
        keywords="Construction Phases, Project Timeline, Phase Tracking, OneCasa Builder"
      />
      <PhasesView />
    </div>
  );
};

export default withUserLayout(PhasesPage);
