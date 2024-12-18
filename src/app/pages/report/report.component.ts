import { afterRender, Component } from '@angular/core';
import { BranchSelectionComponent } from '../../components/branch-selection/branch-selection.component';
import { ChartComponent } from '../../components/chart/chart.component';
import { ChartService } from '../../components/chart/chart.service';

@Component({
  standalone: true,
  selector: 'app-report',
  templateUrl: './report.component.html',
  imports: [
    ChartComponent,
    BranchSelectionComponent,
  ]
})
export default class ReportComponent {
  constructor(
    public chartSvc: ChartService,
  ) {
    afterRender(() => {
      if (chartSvc.reloadChart()) {
        chartSvc.loadCharts();
        chartSvc.reloadChart.set(false);
      }
    })
  }
}
