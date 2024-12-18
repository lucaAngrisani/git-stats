import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { GIT_TYPE } from '../../enums/git-type.enum';
import { ROUTES } from '../../routes/routes.enum';
import { GitService } from '../../services/git.service';
import { GitHubService } from '../../services/github.service';
import { GitLabService } from '../../services/gitlab.service';
import { BranchSelectionService } from '../branch-selection/branch-selection.service';

@Component({
  standalone: true,
  selector: 'app-repo-config',
  templateUrl: './repo-config.component.html',
  imports: [
    Card,
    Button,
    InputText,
    FloatLabel,
    RadioButton,
    ReactiveFormsModule,
  ],
})
export class RepoConfigComponent {

  GIT_TYPE = GIT_TYPE;

  form: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private gitSvc: GitService,
    private gitLabSvc: GitLabService,
    private gitHubSvc: GitHubService,
    private branchSelSvc: BranchSelectionService,
  ) {
    this.form = this.fb.group({
      url: [gitSvc.BASE_URL, Validators.required],
      projectId: [gitSvc.PROJECT_ID, Validators.required],
      accessToken: [gitSvc.TOKEN],
      type: [gitSvc.TYPE, Validators.required],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.gitSvc.setValues([
        this.form.controls['url'].value,
        this.form.controls['projectId'].value,
        this.form.controls['accessToken'].value,
        this.form.controls['type'].value
      ]);

      switch (this.form.controls['type'].value) {
        case GIT_TYPE.GIT_LAB:
          this.gitLabSvc.getBranches().subscribe(branches => {
            if (branches.length > 0) {
              this.branchSelSvc.branchesOption.set(branches);
              this.router.navigate([ROUTES.REPORT]);
            }
          });
          break;
        case GIT_TYPE.GIT_HUB:
          this.gitHubSvc.getBranches().subscribe(branches => {
            if (branches.length > 0) {
              this.branchSelSvc.branchesOption.set(branches);
              this.router.navigate([ROUTES.REPORT]);
            }
          });
          break;
      }
    }
  }
}
