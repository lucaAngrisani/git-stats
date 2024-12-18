import { Component, input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  standalone: true,
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  imports: [
    Card,
  ],
})
export class ChartComponent {
  chartId = input('');
}
