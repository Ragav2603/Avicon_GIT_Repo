import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';

export interface WorkspaceProject {
    id: string;
    name: string;
    org_id: string;
}

interface ProjectContextType {
    activeProject: WorkspaceProject | null;
    setActiveProject: (project: WorkspaceProject | null) => void;
    projects: WorkspaceProject[];
    loading: boolean;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [projects, setProjects] = useState<WorkspaceProject[]>([]);
    const [activeProject, setActiveProject] = useState<WorkspaceProject | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        if (!user) {
            setProjects([]);
            setActiveProject(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Because of RLS, this will only return projects the user has access to
            const { data, error } = await supabase
                .from('projects')
                .select('id, title, user_id')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const fetchedProjects = (data || []).map(d => ({ id: d.id, name: d.title, org_id: d.user_id })) as WorkspaceProject[];
            setProjects(fetchedProjects || []);

            // Select the first project if we don't have one selected or the selected one isn't in the list
            if (fetchedProjects && fetchedProjects.length > 0) {
                if (!activeProject || !fetchedProjects.find(p => p.id === activeProject.id)) {
                    setActiveProject(fetchedProjects[0]);
                }
            } else {
                setActiveProject(null);
            }
        } catch (err) {
            console.error('Error fetching workspace projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    return (
        <ProjectContext.Provider value={{ activeProject, setActiveProject, projects, loading, refreshProjects: fetchProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
