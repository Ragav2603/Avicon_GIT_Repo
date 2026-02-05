import { Users, Shield, Plus, Plane, Wrench, BarChart3 } from 'lucide-react';
import ProjectTemplateCard from './ProjectTemplateCard';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  icon: typeof Users;
  adoptionGoals: { id: string; text: string; enabled: boolean }[];
  dealBreakers: { id: string; text: string; enabled: boolean }[];
  suggestedBudget?: number;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'crew-rostering',
    title: 'Crew Rostering System',
    description: 'Optimize crew scheduling and reduce conflicts',
    icon: Users,
    adoptionGoals: [
      { id: 'cg1', text: 'Reduce scheduling conflicts by 15%', enabled: true },
      { id: 'cg2', text: 'Improve crew satisfaction scores by 10%', enabled: true },
      { id: 'cg3', text: 'Decrease manual scheduling time by 50%', enabled: false },
    ],
    dealBreakers: [
      { id: 'db1', text: 'SOC2 Type II Compliant', enabled: true },
      { id: 'db2', text: 'GDPR Compliant', enabled: true },
      { id: 'db3', text: 'Real-time sync with existing HR systems', enabled: false },
    ],
    suggestedBudget: 250000,
  },
  {
    id: 'safety-management',
    title: 'Safety Management System',
    description: 'Comprehensive safety reporting and analytics',
    icon: Shield,
    adoptionGoals: [
      { id: 'sg1', text: 'Achieve 100% incident reporting compliance', enabled: true },
      { id: 'sg2', text: 'Reduce safety audit preparation time by 40%', enabled: true },
      { id: 'sg3', text: 'Improve hazard identification rate by 25%', enabled: false },
    ],
    dealBreakers: [
      { id: 'sb1', text: 'IOSA Audit Compatible', enabled: true },
      { id: 'sb2', text: 'SMS Part 5 Compliant', enabled: true },
      { id: 'sb3', text: 'Offline mobile capability', enabled: false },
    ],
    suggestedBudget: 180000,
  },
  {
    id: 'flight-ops',
    title: 'Flight Operations Platform',
    description: 'End-to-end flight planning and dispatch',
    icon: Plane,
    adoptionGoals: [
      { id: 'fg1', text: 'Reduce fuel costs by 5%', enabled: true },
      { id: 'fg2', text: 'Improve on-time departure by 10%', enabled: true },
      { id: 'fg3', text: 'Decrease dispatch errors by 30%', enabled: false },
    ],
    dealBreakers: [
      { id: 'fb1', text: 'FAA/EASA Approved', enabled: true },
      { id: 'fb2', text: 'Integration with existing EFB', enabled: true },
      { id: 'fb3', text: '99.9% uptime SLA', enabled: false },
    ],
    suggestedBudget: 500000,
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Engineering',
    description: 'Aircraft maintenance tracking and compliance',
    icon: Wrench,
    adoptionGoals: [
      { id: 'mg1', text: 'Reduce AOG events by 20%', enabled: true },
      { id: 'mg2', text: 'Improve parts availability by 15%', enabled: true },
      { id: 'mg3', text: 'Decrease paperwork processing time by 60%', enabled: false },
    ],
    dealBreakers: [
      { id: 'mb1', text: 'CAMO/Part 145 Compliant', enabled: true },
      { id: 'mb2', text: 'MSG-3 Analysis Support', enabled: true },
      { id: 'mb3', text: 'Blockchain-enabled records', enabled: false },
    ],
    suggestedBudget: 350000,
  },
  {
    id: 'analytics',
    title: 'Operations Analytics',
    description: 'Data-driven insights and reporting',
    icon: BarChart3,
    adoptionGoals: [
      { id: 'ag1', text: 'Consolidate 5+ data sources into one dashboard', enabled: true },
      { id: 'ag2', text: 'Reduce report generation time by 80%', enabled: true },
      { id: 'ag3', text: 'Enable predictive maintenance insights', enabled: false },
    ],
    dealBreakers: [
      { id: 'ab1', text: 'API-first architecture', enabled: true },
      { id: 'ab2', text: 'Self-service report builder', enabled: true },
      { id: 'ab3', text: 'Machine learning capabilities', enabled: false },
    ],
    suggestedBudget: 120000,
  },
  {
    id: 'custom',
    title: 'Custom Request',
    description: 'Start from scratch with your own requirements',
    icon: Plus,
    adoptionGoals: [],
    dealBreakers: [],
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Choose a Template</h2>
        <p className="text-muted-foreground mt-1">
          Start with pre-configured adoption goals or build from scratch
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROJECT_TEMPLATES.map((template) => (
          <ProjectTemplateCard
            key={template.id}
            title={template.title}
            description={template.description}
            icon={template.icon}
            isSelected={selectedTemplate === template.id}
            onClick={() => onSelectTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
