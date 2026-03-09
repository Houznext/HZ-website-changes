import withAdminLayout from '@/src/common/AdminLayout';
import ItemAnalyticsComponent from '@/src/components/ItemAnalyticsComponent';

import ViewAnalyticsComponent from '@/src/components/ViewAnalyticsComponent'
import React from 'react';

const itemanalytics = () => {
  return (
    <div className="flex w-full min-h-full">
     
     <ItemAnalyticsComponent/>
    </div>
  );
};

export default withAdminLayout(itemanalytics);
