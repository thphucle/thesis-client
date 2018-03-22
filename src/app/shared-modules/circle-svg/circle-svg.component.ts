import { Component, OnInit, Input } from '@angular/core';

export interface CircleSvgOption {
  width: number
  height: number
  startAngle: number // degree not radian
  endAngle: number
  radius: number
  stroke: string // hex format
  strokeWidth: number
  circleStrokeColor: string
  circleStrokeWidth: number
  text?: string
}

@Component({
  selector: 'app-circle-svg',
  templateUrl: './circle-svg.component.html',
  styleUrls: ['./circle-svg.component.scss']
})
export class CircleSvgComponent implements OnInit {
  chartOptions = {
    width: 100,
    height: 100,
    startAngle: 0, // degree not radian
    endAngle: 0,
    radius: 40,
    stroke: '#000',
    strokeWidth: 10
  };

  chartOptionsCircle = {
    width: 100,
    height: 100,
    startAngle: 0, // degree not radian
    endAngle: 359,
    radius: 40,
    stroke: '#000',
    strokeWidth: 5
  };

  @Input('options')
  set options(val: CircleSvgOption) {
    if (!val) return;
    this.chartOptions = Object.assign(this.chartOptions, val);
    this.chartOptionsCircle.strokeWidth = val.circleStrokeWidth || parseInt(this.chartOptions.strokeWidth/2 + '');
    this.chartOptionsCircle.width = this.chartOptions.width;
    this.chartOptionsCircle.height = this.chartOptions.height;
    this.chartOptionsCircle.radius = this.chartOptions.radius;
    this.chartOptionsCircle.stroke = val.circleStrokeColor || this.chartOptionsCircle.stroke;

    this.d = this.generateDValue(this.chartOptions);
    this.dCircle = this.generateDValue(this.chartOptionsCircle);
  }

  d = '';
  dCircle = '';

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  describeArc(x, y, radius, startAngle, endAngle){
  
      var start = this.polarToCartesian(x, y, radius, endAngle);
      var end = this.polarToCartesian(x, y, radius, startAngle);
  
      var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
      var d = [
          "M", start.x, start.y, 
          "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
  
      return d;       
  }

  constructor() { }

  ngOnInit() {
    
  }

  generateDValue(options) {    
    let {width,height, radius, startAngle, endAngle} = options;
    let centerX = parseInt(width/2 + '');
    let centerY = parseInt(height/2 + '');

    return this.describeArc(centerX, centerY, radius, startAngle, endAngle);    
  }

}
