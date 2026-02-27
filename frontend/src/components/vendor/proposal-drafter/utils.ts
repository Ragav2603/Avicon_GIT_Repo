
export const calculateComplianceScore = (baseScore: number, content: string): number => {
  if (baseScore === 0) return 0;
  const keywords = ['security', 'compliance', 'soc2', 'iso', 'encryption', 'uptime', 'api', 'integration', 'cloud', 'redundancy'];
  const found = keywords.filter(k => (content || '').toLowerCase().includes(k));
  const bonus = Math.min(10, found.length);
  return Math.min(100, baseScore + bonus);
};
