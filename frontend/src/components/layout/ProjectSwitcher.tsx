import React, { useState } from 'react';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function ProjectSwitcher() {
    const { activeProject, setActiveProject, projects, loading } = useProject();
    const { role } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleCreateProject = () => {
        setOpen(false);
        navigate(`/${role}-dashboard`);
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 p-2 w-full animate-pulse bg-sidebar-accent/50 rounded-lg h-10">
                <div className="w-6 h-6 bg-sidebar-accent rounded"></div>
                <div className="flex-1 bg-sidebar-accent h-4 rounded"></div>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent hover:border-sidebar-border"
                >
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 shrink-0 text-sidebar-foreground/70" />
                        <span className="truncate text-sm font-medium">
                            {activeProject ? activeProject.name : "Select Workspace"}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <div className="flex flex-col max-h-[300px] overflow-auto">
                    {projects.length === 0 ? (
                        <div className="p-4 text-center flex flex-col gap-3">
                            <p className="text-sm text-slate-500">No projects found.</p>
                            <Button onClick={handleCreateProject} size="sm" className="w-full text-xs">
                                Create Project
                            </Button>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => {
                                    setActiveProject(project);
                                    setOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${activeProject?.id === project.id ? 'bg-slate-50 dark:bg-slate-800/50 font-medium' : ''
                                    }`}
                            >
                                <span className="truncate">{project.name}</span>
                                {activeProject?.id === project.id && (
                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                                )}
                            </button>
                        ))
                    )}
                </div>
                {projects.length > 0 && (
                    <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            onClick={handleCreateProject}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                            <Plus className="h-3.5 w-3.5 mr-2" />
                            New Project
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
