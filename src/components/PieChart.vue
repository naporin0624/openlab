import { Component, Prop, Mixins } from "vue-property-decorator"; import Chart
from "chart.js"; import { Pie, mixins } from "vue-chartjs"; @Component export
default class PieChart extends Mixins(Pie, mixins.reactiveProp) { @Prop() public
chartData!: Chart.ChartData; @Prop() public chartOption?: Chart.ChartOptions;
public mounted() { this.renderChart(this.chartData, this.chartOption); } }
