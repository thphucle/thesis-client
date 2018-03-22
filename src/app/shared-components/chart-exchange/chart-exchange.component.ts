import { Component, OnInit } from '@angular/core';
import { RateStatisticService } from 'app/shared-services/api/exchange.service';

@Component({
  selector: 'app-chart-exchange',
  template: `
  <div id="live-chart" style="height: 400px"></div>
  `
})
export class ChartExchangeComponent implements OnInit {
  options: Object;
  constructor(
      private rateStatistic: RateStatisticService
  ) {

  }

  async ngOnInit() {
    await this.renderChart();
  }

  async renderChart () {
    try {
      let rates = await this.rateStatistic.list();
      rates = rates && rates.data;

      let result = [];
      rates.forEach(rate => {
        result.push([
          rate.time, rate.open, rate.max, rate.min, rate.close
        ]);
      });
      Highcharts.stockChart('live-chart', {
        rangeSelector: {
          selected: 1,
          buttons: [{
            type: 'day',
            count: 1,
            text: '1d',
          }, {
            type: 'day',
            count: 3,
            text: '3d'
          }, {
            type: 'week',
            count: 1,
            text: '1w'
          }, {
            type: 'month',
            count: 1,
            text: '1m'
          },
          {
            type: 'all',
            text: 'All'
          }
        ]
        },
        title: {
          text: 'MARKET CHART'
        },
        series: [{
          type: 'candlestick',
          name: 'MARKET CHART',
          data: result,
          dataGrouping: {
            units: [
              [
                'minute',
                [1, 2, 5, 10, 15, 30]
              ],
              [
                'hour',
                [1, 2, 3, 4, 6, 8, 12]
              ], [
                  'day',
                  [1]
              ],
              [
                  'week', // unit name
                  [1] // allowed multiples
              ], [
                  'month',
                  [1, 2, 3, 4, 6]
              ]
            ]
          }
        }],
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

}
