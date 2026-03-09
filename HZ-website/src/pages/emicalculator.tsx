import EmiCalView from '@/components/EmiCalculator';
import withGeneralLayout from '@/components/Layouts/GeneralLayout';
import React from 'react';

const emicalcultor = () => {
  return (
    <div>
      <EmiCalView />
    </div>
  );
};

export default withGeneralLayout(emicalcultor);
