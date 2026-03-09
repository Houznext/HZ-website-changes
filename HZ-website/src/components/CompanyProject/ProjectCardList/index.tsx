import apiClient from '@/utils/apiClient';
import React, { useEffect, useState } from 'react';
import { CompanyProjectCard } from './companyProjectCard';
import Loader from '@/components/Loader'

const ProjectCardList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProject = async () => {
        try {
            const res = await apiClient.get(`${apiClient.URLS.companyonboarding}/get-all-projects`);
            if (res?.status === 200) {
                setProjects(res.body?.data || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, []);

    if (loading) return <p><Loader /></p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:px-8 px-4 ">
            {projects.map((project: any) => (
                <CompanyProjectCard data={project} />
            ))}
        </div>
    );
};

export default ProjectCardList;
