import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  XCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import VendorDashboardLayout from '@/components/vendor/VendorDashboardLayout';

const VendorAnalyticsPage = () => {
  // Mock analytics data
  const performanceMetrics = {
    totalSubmissions: 23,
    acceptedProposals: 8,
    shortlisted: 5,
    declined: 4,
    pending: 6,
    winRate: 34.8,
    avgScore: 78,
  };

  const dealBreakerAnalysis = [
    { requirement: 'ISO 27001 Certification', fails: 5, action: 'Obtain certification' },
    { requirement: 'SOC2 Type II Audit', fails: 3, action: 'Schedule audit' },
    { requirement: 'US Data Residency', fails: 2, action: 'Configure US region' },
    { requirement: 'API Documentation', fails: 1, action: 'Update docs' },
  ];

  const monthlyTrend = [
    { month: 'Aug', submissions: 3, wins: 1 },
    { month: 'Sep', submissions: 5, wins: 2 },
    { month: 'Oct', submissions: 4, wins: 1 },
    { month: 'Nov', submissions: 6, wins: 2 },
    { month: 'Dec', submissions: 5, wins: 2 },
  ];

  return (
    <VendorDashboardLayout title="Performance Analytics" subtitle="Track your proposal success metrics">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-3xl font-bold">{performanceMetrics.totalSubmissions}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold text-green-500">{performanceMetrics.winRate}%</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-green-500 text-sm">
                <ArrowUp className="h-3 w-3" />
                <span>+5.2% vs last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg AI Score</p>
                  <p className="text-3xl font-bold text-primary">{performanceMetrics.avgScore}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deal Breaker Fails</p>
                  <p className="text-3xl font-bold text-red-500">11</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                <ArrowDown className="h-3 w-3" />
                <span>-3 vs last quarter</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submission Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Proposal Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Accepted</span>
                  </div>
                  <Badge className="bg-green-500">{performanceMetrics.acceptedProposals}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span>Shortlisted</span>
                  </div>
                  <Badge className="bg-yellow-500">{performanceMetrics.shortlisted}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                    <span>Pending</span>
                  </div>
                  <Badge variant="secondary">{performanceMetrics.pending}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>Declined</span>
                  </div>
                  <Badge className="bg-red-500">{performanceMetrics.declined}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Breaker Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Deal Breaker Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Requirements that caused proposal rejections
              </p>
              <div className="space-y-3">
                {dealBreakerAnalysis.map((item, index) => (
                  <motion.div
                    key={item.requirement}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-border hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.requirement}</span>
                      <Badge variant="destructive" className="text-xs">
                        {item.fails} fails
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Action needed: {item.action}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Monthly Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-4 pt-4">
              {monthlyTrend.map((month, index) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 justify-center h-full items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(month.submissions / 6) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-6 bg-primary/30 rounded-t"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(month.wins / 6) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className="w-6 bg-green-500 rounded-t"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/30 rounded" />
                <span className="text-sm text-muted-foreground">Submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-muted-foreground">Wins</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </VendorDashboardLayout>
  );
};

export default VendorAnalyticsPage;
