import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { JobAnalytics } from '../../models/job-tracker.models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <div class="page-header">
        <div>
          <h2>Job Search Analytics & Insights 📈</h2>
          <p class="subtext">Deep-dive into conversion rates, application velocity, and top-performing job sources.</p>
        </div>
      </div>

      <div *ngIf="analytics(); else loadingTpl">
        <!-- Analytics Top KPI Row -->
        <div class="analytics-kpi-grid">
          <div class="kpi-box glass-card">
            <span class="kpi-title">Interview Conversion Rate</span>
            <div class="kpi-number gradient-text">{{ analytics()?.summary?.interviewConversionRate }}%</div>
            <p class="kpi-desc">Applications progressing to interview round</p>
          </div>

          <div class="kpi-box glass-card">
            <span class="kpi-title">Offer / Selection Rate</span>
            <div class="kpi-number emerald">{{ analytics()?.summary?.selectionRate }}%</div>
            <p class="kpi-desc">Applications resulting in job offer</p>
          </div>

          <div class="kpi-box glass-card">
            <span class="kpi-title">Avg Application Velocity</span>
            <div class="kpi-number amber">{{ analytics()?.summary?.averageDaysToInterview }} Days</div>
            <p class="kpi-desc">Average time from application to 1st interview</p>
          </div>
        </div>

        <!-- Visual Analytics Grid -->
        <div class="analytics-charts-grid">
          <!-- Top Job Sources Performance -->
          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>🌐 Most Successful Job Sources</h3>
              <span class="sub font-sm">Applications vs Interviews by Source</span>
            </div>

            <div class="sources-list">
              <div class="source-bar-item" *ngFor="let s of analytics()?.topSources">
                <div class="source-info">
                  <span class="source-name">{{ s.source }}</span>
                  <span class="source-stats">{{ s.interviewCount }} Interviews / {{ s.applicationCount }} Applied ({{ s.successRate }}% Offer Rate)</span>
                </div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width.%]="getSourcePercentage(s.applicationCount)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Trend Funnel -->
          <div class="glass-card chart-card">
            <div class="chart-header">
              <h3>📊 Monthly Application Velocity</h3>
              <span class="sub font-sm">Tracking application volume over last 6 months</span>
            </div>

            <div class="monthly-bars">
              <div class="month-col" *ngFor="let m of analytics()?.monthlyTrends">
                <div class="col-bar-wrapper">
                  <div class="col-bar app-bar" [style.height.px]="m.applicationCount * 18" title="{{ m.applicationCount }} Applications">
                    <span class="col-val">{{ m.applicationCount }}</span>
                  </div>
                  <div class="col-bar int-bar" [style.height.px]="m.interviewCount * 18" title="{{ m.interviewCount }} Interviews">
                    <span class="col-val">{{ m.interviewCount }}</span>
                  </div>
                </div>
                <span class="month-label">{{ m.monthYear }}</span>
              </div>
            </div>

            <div class="legend-row">
              <div class="legend-item"><span class="dot blue"></span> Applications</div>
              <div class="legend-item"><span class="dot purple"></span> Interviews</div>
            </div>
          </div>
        </div>

        <!-- Status Pipeline Funnel -->
        <div class="glass-card funnel-card">
          <h3>📌 Application Pipeline Funnel</h3>
          <div class="funnel-grid">
            <div class="funnel-step" *ngFor="let entry of getStatusEntries()">
              <span class="step-label">{{ entry.key }}</span>
              <span class="step-count">{{ entry.value }}</span>
              <div class="step-pill" [ngClass]="'badge-' + entry.key"></div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="glass-card empty-container">
          <p>Loading analytics data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .subtext { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .analytics-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .kpi-box { padding: 1.75rem; text-align: center; }
    .kpi-title { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
    .kpi-number { font-size: 2.5rem; font-weight: 800; margin: 0.4rem 0; line-height: 1.1; }
    .kpi-number.emerald { color: var(--accent-emerald); }
    .kpi-number.amber { color: var(--accent-amber); }
    .kpi-desc { font-size: 0.75rem; color: var(--text-dim); }
    .analytics-charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .chart-card { padding: 1.75rem; }
    .chart-header { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem; }
    .chart-header .sub { color: var(--text-muted); }
    .sources-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .source-info { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .source-name { font-weight: 600; }
    .source-stats { color: var(--text-muted); font-size: 0.8rem; }
    .bar-container { height: 10px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--accent-teal) 100%); border-radius: 10px; transition: width 0.5s ease; }
    .monthly-bars { display: flex; justify-content: space-around; align-items: flex-end; height: 180px; padding: 1rem 0; }
    .month-col { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .col-bar-wrapper { display: flex; align-items: flex-end; gap: 4px; }
    .col-bar { width: 18px; border-radius: 6px 6px 0 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 2px; }
    .col-bar.app-bar { background: var(--primary); }
    .col-bar.int-bar { background: var(--accent-purple); }
    .col-val { font-size: 0.65rem; color: white; font-weight: 700; }
    .month-label { font-size: 0.75rem; color: var(--text-muted); }
    .legend-row { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; }
    .legend-item { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.blue { background: var(--primary); }
    .dot.purple { background: var(--accent-purple); }
    .funnel-card { padding: 1.75rem; }
    .funnel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-top: 1.25rem; }
    .funnel-step { background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; text-align: center; border: 1px solid var(--border-subtle); }
    .step-label { display: block; font-size: 0.85rem; color: var(--text-muted); }
    .step-count { font-size: 1.8rem; font-weight: 700; display: block; margin: 0.2rem 0; }
    .step-pill { height: 4px; border-radius: 2px; margin-top: 0.5rem; }
    .empty-container { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
  `]
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  public analytics = signal<JobAnalytics | null>(null);

  public ngOnInit(): void {
    this.analyticsService.getDetailedAnalytics().subscribe({
      next: (data: JobAnalytics) => this.analytics.set(data),
      error: () => {}
    });
  }

  public getSourcePercentage(count: number): number {
    const max = Math.max(...(this.analytics()?.topSources.map(s => s.applicationCount) || [10]));
    return Math.min(100, Math.max(15, (count / (max || 1)) * 100));
  }

  public getStatusEntries(): { key: string; value: number }[] {
    const bd = this.analytics()?.statusBreakdown || {};
    return Object.keys(bd).map(k => ({ key: k, value: bd[k] }));
  }
}
