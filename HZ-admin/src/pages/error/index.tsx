import withAdminLayout from '@/src/common/AdminLayout';
import React from 'react';

const Unauthenticated = () => {
    return (
        <div className="flex w-full h-screen items-center justify-center bg-gray-100">
            <div className="text-center p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-6">
                    You dont have permission to access this page
                </p>
                
            </div>
        </div>
    );
};

export default withAdminLayout(Unauthenticated);
