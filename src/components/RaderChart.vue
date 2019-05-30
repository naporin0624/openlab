<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import Chart from "chart.js";
import { Radar, mixins } from "vue-chartjs";

@Component
export default class RaderChar extends Mixins(Radar, mixins.reactiveProp) {
  @Prop() public chartData!: Chart.ChartData;
  @Prop() public chartOption?: Chart.ChartOptions;

  public mounted() {
    this.renderChart(this.chartData, this.chartOption);
  }
}
</script>
