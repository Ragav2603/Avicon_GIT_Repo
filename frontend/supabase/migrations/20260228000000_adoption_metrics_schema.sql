-- Adoption Metrics Schema
-- Tracks telemetry integrations and usage metrics for accepted RFP submissions

-- Telemetry Connections table
CREATE TABLE IF NOT EXISTS telemetry_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('adobe_analytics', 'appdynamics', 'appinsights', 'manual')),
    name TEXT NOT NULL,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    config JSONB DEFAULT '{}', -- Encrypted credentials stored here
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error', 'disconnected')),
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Metrics table
CREATE TABLE IF NOT EXISTS adoption_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES telemetry_connections(id) ON DELETE SET NULL,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('daily_active_users', 'feature_usage', 'session_duration', 'page_views', 'custom')),
    metric_name TEXT NOT NULL,
    current_value NUMERIC DEFAULT 0,
    previous_value NUMERIC,
    change_percent NUMERIC,
    trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
    data_points JSONB DEFAULT '[]', -- Time series data
    source TEXT DEFAULT 'telemetry' CHECK (source IN ('telemetry', 'manual')),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manual Metric Entries table
CREATE TABLE IF NOT EXISTS manual_metric_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adoption Summaries view (for quick dashboard access)
CREATE OR REPLACE VIEW adoption_summaries AS
SELECT 
    s.id as submission_id,
    s.rfp_id,
    r.title as rfp_title,
    p.company_name as vendor_name,
    s.pitch_text as solution_name,
    s.status as submission_status,
    r.airline_id,
    COALESCE(AVG(am.current_value), 0) as adoption_score,
    CASE 
        WHEN COALESCE(AVG(am.current_value), 0) >= 70 THEN 'healthy'
        WHEN COALESCE(AVG(am.current_value), 0) >= 40 THEN 'warning'
        ELSE 'critical'
    END as health_status,
    COUNT(DISTINCT tc.id) as connection_count,
    MAX(tc.last_sync) as last_sync
FROM submissions s
JOIN rfps r ON s.rfp_id = r.id
LEFT JOIN profiles p ON s.vendor_id = p.id
LEFT JOIN adoption_metrics am ON s.id = am.submission_id
LEFT JOIN telemetry_connections tc ON s.id = tc.submission_id
WHERE s.status = 'accepted'
GROUP BY s.id, s.rfp_id, r.title, p.company_name, s.pitch_text, s.status, r.airline_id;

-- RLS Policies for Adoption Metrics

-- Enable RLS
ALTER TABLE telemetry_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_metric_entries ENABLE ROW LEVEL SECURITY;

-- Telemetry Connections policies
-- Airlines can view connections for their RFPs
CREATE POLICY "Airlines can view their telemetry connections"
    ON telemetry_connections FOR SELECT
    USING (
        rfp_id IN (
            SELECT id FROM rfps WHERE airline_id = auth.uid()
        )
    );

-- Vendors can view connections for their submissions
CREATE POLICY "Vendors can view their telemetry connections"
    ON telemetry_connections FOR SELECT
    USING (
        submission_id IN (
            SELECT id FROM submissions WHERE vendor_id = auth.uid()
        )
    );

-- Airlines can create connections for accepted submissions on their RFPs
CREATE POLICY "Airlines can create telemetry connections"
    ON telemetry_connections FOR INSERT
    WITH CHECK (
        rfp_id IN (
            SELECT id FROM rfps WHERE airline_id = auth.uid()
        )
    );

-- Adoption Metrics policies
CREATE POLICY "Airlines can view metrics for their RFPs"
    ON adoption_metrics FOR SELECT
    USING (
        rfp_id IN (
            SELECT id FROM rfps WHERE airline_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view metrics for their submissions"
    ON adoption_metrics FOR SELECT
    USING (
        submission_id IN (
            SELECT id FROM submissions WHERE vendor_id = auth.uid()
        )
    );

-- Manual Metric Entries policies
CREATE POLICY "Airlines can manage manual entries for their RFPs"
    ON manual_metric_entries FOR ALL
    USING (
        rfp_id IN (
            SELECT id FROM rfps WHERE airline_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view manual entries for their submissions"
    ON manual_metric_entries FOR SELECT
    USING (
        submission_id IN (
            SELECT id FROM submissions WHERE vendor_id = auth.uid()
        )
    );

-- Consultants can view all adoption data (for ROI analysis)
CREATE POLICY "Consultants can view all telemetry connections"
    ON telemetry_connections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'consultant'
        )
    );

CREATE POLICY "Consultants can view all adoption metrics"
    ON adoption_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'consultant'
        )
    );

CREATE POLICY "Consultants can view all manual entries"
    ON manual_metric_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'consultant'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemetry_connections_submission ON telemetry_connections(submission_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_connections_rfp ON telemetry_connections(rfp_id);
CREATE INDEX IF NOT EXISTS idx_adoption_metrics_submission ON adoption_metrics(submission_id);
CREATE INDEX IF NOT EXISTS idx_adoption_metrics_rfp ON adoption_metrics(rfp_id);
CREATE INDEX IF NOT EXISTS idx_manual_entries_submission ON manual_metric_entries(submission_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_adoption_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telemetry_connections_updated_at
    BEFORE UPDATE ON telemetry_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_adoption_updated_at();
