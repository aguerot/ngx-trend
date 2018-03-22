import { Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import json from '../lib/package.json';

const gradients = [
  ['#222'],
  ['#2196F3'],
  ['red', 'orange', 'yellow'],
  ['purple', 'violet'],
  ['#00c6ff', '#F0F', '#FF0'],
  ['#f72047', '#ffd200', '#1feaea'],
];

const linecaps = ['butt', 'round', 'square'];

const defaultGradient = gradients[4];
const defaultLinecap = linecaps[0];
const placeholderData = [ 0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 5 ];
const placeholderDataWithProjection = [ 0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 5, 4,  3, 2, 1, 0, 0, 0 ];

@Component({
  selector: 'app-root',
  template: `
  <div class="app">
    <demo-header></demo-header>
    <div style="text-align: center;margin-bottom: 2rem;">
      <mdo-github-button
        size="large"
        count="true"
        user="scttcper"
        repo="ngx-trend"
        >
      </mdo-github-button>
    </div>
    <ngx-trend
      autoDraw="true"
      autoDrawDuration="2000"
      autoDrawEasing="ease-out"
      smooth="true"
      [normalizationFunction]="normalizer"
      [data]="placeholderData"
      [gradient]="gradient"
      [radius]="radius"
      [strokeWidth]="strokeWidth"
      [strokeLinecap]="strokeLinecap">
    </ngx-trend>
    <ngx-trend class="projection"
    autoDraw="true"
    autoDrawDuration="3000"
    autoDrawEasing="ease-out"
    smooth="true"
    [normalizationFunction]="normalizer"
    [data]="placeholderDataWithProjection"
    [gradient]="gradient"
    [radius]="radius"
    strokeDasharray="5,5"
    strokeWidth="1">
  </ngx-trend>

    <div class="tabGroup">
      <button
        class="tab"
        (click)="changeView('config')"
        [class.isActive]="view === 'config'"
      >
        Configure
      </button>
      <button
        class="tab"
        (click)="changeView('code')"
        [class.isActive]="view === 'code'"
      >
        Code
      </button>
    </div>
    <config
      *ngIf="view === 'config'"
      [gradients]="gradients"
      [gradient]="gradient"
      [linecaps]="linecaps"
      [(strokeWidth)]="strokeWidth"
      [(radius)]="radius"
      [strokeLinecap]="strokeLinecap"
      [handleUpdate]="updateTrendParam"
    >
    </config>
    <trend-code
      *ngIf="view === 'code'"
      [data]="placeholderData"
      [gradient]="gradient"
      [radius]="radius"
      [strokeWidth]="strokeWidth"
      [strokeLinecap]="strokeLinecap"
    >
    </trend-code>
    <demo-footer></demo-footer>
  </div>
  `

})
export class AppComponent implements OnInit {
  gradients = gradients;
  linecaps = linecaps;
  placeholderData = placeholderData;
  placeholderDataWithProjection = placeholderDataWithProjection;
  view = 'config';
  radius = 10;
  strokeWidth = 2;
  gradient = defaultGradient;
  strokeLinecap = defaultLinecap;
  updateTrendParam = new EventEmitter<[string, any]>();


  maxYValue = 20;
  maxXValue = 20;

  normalizer = (data: number[], minX: number, maxX: number, minY: number, maxY: number) => {
    // For the X axis, we want to normalize it based on its index in the array.
    // For the Y axis, we want to normalize it based on the element's value.
    //
    // X axis is easy: just evenly-space each item in the array.
    // For the Y axis, we first need to find the min and max of our array,
    // and then normalize those values between 0 and 1.
    const boundariesX = { min: 0, max: Math.max(data.length - 1, this.maxXValue) };
    const boundariesY = { min: Math.min(...data), max:  Math.max(...data, this.maxYValue) };

    const normalizedData = data.map((point, index) => ({
      x: this.normalize(index, boundariesX.min, boundariesX.max, minX, maxX),
      y: this.normalize(point, boundariesY.min, boundariesY.max, minY, maxY),
    }));

    // According to the SVG spec, paths with a height/width of `0` can't have
    // linear gradients applied. This means that our lines are invisible when
    // the dataset is flat (eg. [0, 0, 0, 0]).
    //
    // The hacky solution is to apply a very slight offset to the first point of
    // the dataset. As ugly as it is, it's the best solution we can find (there
    // are ways within the SVG spec of changing it, but not without causing
    // breaking changes).
    if (boundariesY.min === boundariesY.max) {
      normalizedData[0].y += 0.0001;
    }

    return normalizedData;
  }

  private normalize = (value: number, min: number, max: number, scaleMin = 0, scaleMax = 1) => {
    // If the `min` and `max` are the same value, it means our dataset is flat.
    // For now, let's assume that flat data should be aligned to the bottom.
    if (min === max) {
      return scaleMin;
    }

    return scaleMin + (value - min) * (scaleMax - scaleMin) / (max - min);
  }
  constructor(title: Title) {
    const current = title.getTitle();
    // fix for tests
    if (json) {
      title.setTitle(`${current} ${json.version}`);
    }
  }


  changeView(view: string) {
    this.view = view;
  }
  ngOnInit() {
    this.updateTrendParam.subscribe(([key, value]) => this[key] = value);
  }
}
