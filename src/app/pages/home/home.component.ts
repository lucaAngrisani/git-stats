import { afterRender, Component } from '@angular/core';
import { RepoConfigComponent } from '../../components/repo-config/repo-config.component';
import { GitLabService } from '../../services/gitlab.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    RepoConfigComponent,
  ],
})
export default class HomeComponent {

  searchComplete: boolean = false;
  chartGenerated: boolean = false;
  rendered: boolean = false;

  constructor(
    //private chartSvc: ChartService,
    private gitLabSvc: GitLabService,
  ) {

    afterRender(() => {
      if (this.chartGenerated && !this.rendered) {
        this.rendered = true;
        //this.chartSvc.renderChart();
      }
    });
  }

}
