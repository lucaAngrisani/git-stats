import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { forkJoin } from 'rxjs';
import { GIT_TYPE } from '../../enums/git-type.enum';
import { Branch } from '../../models/branch.model';
import { ROUTES } from '../../routes/routes.enum';
import { GitService } from '../../services/git.service';
import { GitHubService } from '../../services/github.service';
import { GitLabService } from '../../services/gitlab.service';
import { ChartService } from '../chart/chart.service';
import { BranchSelectionService } from './branch-selection.service';

@Component({
  standalone: true,
  selector: 'app-branch-selection',
  templateUrl: './branch-selection.component.html',
  imports: [
    Card,
    Button,
    FloatLabel,
    MultiSelect,
    InputNumber,
    ReactiveFormsModule,
  ],
})
export class BranchSelectionComponent implements OnInit {

  branchesForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private chartSvc: ChartService,
    private gitLabSvc: GitLabService,
    private gitHubSvc: GitHubService,
    public branchSelSvc: BranchSelectionService,
    public gitSvc: GitService,
  ) {
    this.branchesForm = this.fb.group({
      branches: [[], Validators.required],
      numMaxCommit: [1000, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.branchSelSvc.branchesOption()?.length) {
      switch (this.gitSvc.TYPE) {
        case GIT_TYPE.GIT_LAB:
          this.gitLabSvc.getBranches().subscribe(branches => {
            if (branches.length > 0) {
              this.branchSelSvc.branchesOption.set(branches);
            }
          });
          break;
        case GIT_TYPE.GIT_HUB:
          this.gitHubSvc.getBranches().subscribe(branches => {
            if (branches.length > 0) {
              this.branchSelSvc.branchesOption.set(branches);
            }
          });
          break;
      }
    }
  }

  onSelectBranches() {
    const service = this.gitSvc.TYPE == GIT_TYPE.GIT_LAB ? this.gitLabSvc : this.gitHubSvc;

    forkJoin(
      (this.branchesForm.controls['branches'].value as Branch[]).map(branch => service.getCommits(branch.name, this.branchesForm.controls['numMaxCommit'].value))
    ).subscribe(response => {
      this.chartSvc.commitsPerBranch.set(response);
      this.chartSvc.loadedData.set(true);
      this.chartSvc.reloadChart.set(true);
    });
  }

  back() {
    this.router.navigate([ROUTES.HOME]);
  }
}
