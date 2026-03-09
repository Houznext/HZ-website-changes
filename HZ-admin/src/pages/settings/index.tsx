import withAdminLayout from '@/src/common/AdminLayout'
import SettingsView from '@/src/components/SettingsView'
import React from 'react'

const Settings = () => {
    return (
        <div>
            <SettingsView />
        </div>
    )
}

export default withAdminLayout(Settings)