import ProjectCardList from '@/components/CompanyProject/ProjectCardList'
import withGeneralLayout from '@/components/Layouts/GeneralLayout'
import React from 'react'

const Projects = () => {
    return (
        <div>
            <ProjectCardList />
        </div>
    )
}

export default withGeneralLayout(Projects)