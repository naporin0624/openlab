<template>
  <div class="wrapper">
    <v-container>
      <v-layout wrap align-center justify-center row fill-height>
        <v-flex md6 xs12 ref="videobox">
          <video
            ref="video"
            autoplay
            loop
            style="transform: scaleX(-1)"
          ></video>
          <canvas ref="canvas" style="display: none"></canvas>
          <canvas ref="draw" style="display: none"></canvas>
          <canvas ref="image" style="display: none"></canvas>
          <v-container>
            <v-layout wrap align-center justify-center row fill-height>
              <v-flex md4 v-for="(imgsrc, idx) in personImage" :key="idx">
                <v-img
                  :src="imgsrc"
                  width="160"
                  height="160"
                  style="margin: auto; transform: scaleX(-1);"
                  :style="{ border: 'solid 5px ' + colorList[idx] }"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex md6 xs12>
          <RaderChart
            :chartData="chartData"
            :chartOption="chartOption"
          ></RaderChart>
        </v-flex>
      </v-layout>
    </v-container>
    <v-btn @click.end="toggleFaceEmotionRecognition">おしてね</v-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { faceEmotionDetector } from "@/API/index";
import { Prediction } from "@/API/types";
import Chart from "chart.js";

// helper function
import { base64ToBuffer } from "@/utils/index";
const color = Chart.helpers.color;

// Component
import RaderChart from "@/components/RaderChart.vue";

@Component({
  components: {
    RaderChart
  }
})
export default class FaceEmotionDemo extends Vue {
  public personImage: string[] = [];
  public isFaceRecognitionStart: boolean = false;
  public colorList: string[] = [
    "#2196F3",
    "#4CAF50",
    "#FFEB3B",
    "#FF9800",
    "#F44336"
  ];

  // Chart.js setting
  public chartData: Chart.ChartData = {
    labels: [
      "neutral",
      "happiness",
      "surprise",
      "sadness",
      "anger",
      "disgest",
      "fear",
      "contempt"
    ]
  };
  public title: Chart.ChartTitleOptions = {
    display: true,
    fontColor: "#666666",
    text: "Face Emotion Chart",
    fontSize: 32,
    padding: 16
  };
  public chartOption: Chart.ChartOptions = {
    title: this.title,
    animation: {
      duration: 100
    }
  };

  // Use WebCam setting
  async mounted() {
    const deviceNav = navigator.mediaDevices.getUserMedia({
      audio: false,
      // 内カメラ
      video: { facingMode: "user" }
    });
    const stream = await deviceNav;
    const video = <HTMLVideoElement>this.$refs.video;
    const videoBox = <HTMLVideoElement>this.$refs.videobox;
    video.srcObject = stream;
    video.width = videoBox.clientWidth;
  }

  // btnAction
  public toggleFaceEmotionRecognition(): void {
    if (this.isFaceRecognitionStart) {
      this.isFaceRecognitionStart = false;
    } else {
      this.isFaceRecognitionStart = true;
      this.faceEmotionRecognitionPerSec();
    }
  }

  public faceEmotionRecognitionPerSec(): void {
    setInterval(async () => {
      if (!this.isFaceRecognitionStart) clearInterval();
      else {
        const canvas = <HTMLCanvasElement>this.$refs.canvas;
        const video = <HTMLVideoElement>this.$refs.video;
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        const context = <CanvasRenderingContext2D>canvas.getContext("2d");
        // 画像取得
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageURL: string = canvas.toDataURL("image/png");
        const base64: string = imageURL.split(",")[1];
        const buffer: ArrayBuffer = base64ToBuffer(base64);
        // APIのリソース生成
        const blob: Blob = new Blob([buffer], { type: "image/png" });
        // API叩く
        const predicts: Prediction[] = await faceEmotionDetector(blob);
        // Chartを作るデータの作成
        const datasets: Chart.ChartDataSets[] = predicts.map(
          (predict: Prediction, idx: number) => {
            return {
              label: `Person${idx + 1}`,
              backgroundColor: color(this.colorList[idx])
                .alpha(0.5)
                .rgbString(),
              borderColor: color(this.colorList[idx]).rgbString(),
              pointBackgroundColor: color(this.colorList[idx]).rgbString(),
              data: predict.emotion_predictions
                .sort((a: any, b: any) => {
                  return a.label_id - b.label_id;
                })
                .map((a: any) => {
                  return a.probability;
                })
            };
          }
        );

        // データの更新
        this.chartData = {
          labels: [
            "neutral",
            "happiness",
            "surprise",
            "sadness",
            "anger",
            "disgest",
            "fear",
            "contempt"
          ],
          datasets
        };
        // ymin, xmin, ymax, xmax

        this.personImage = await Promise.all(
          predicts.map(async (predict: Prediction, idx: number) => {
            const draw = <HTMLCanvasElement>this.$refs.draw;
            const imageCanvas = <HTMLCanvasElement>this.$refs.image;

            const image = new Image();
            image.src = imageURL;

            function imageOnload() {
              image.onload = () => {
                return Promise.resolve(true);
              };
            }
            // 画像が読み込まれるまで待つ
            await imageOnload();

            draw.width = image.width;
            draw.height = image.height;
            const ctx = <CanvasRenderingContext2D>draw.getContext("2d");

            const ymin: number = canvas.height * predict.detection_box[0] - 25;
            const xmin: number = canvas.width * predict.detection_box[1] - 25;
            const ymax: number = canvas.height * predict.detection_box[2] + 25;
            const xmax: number = canvas.width * predict.detection_box[3] + 25;

            ctx.drawImage(image, 0, 0);
            const image1 = ctx.getImageData(
              xmin,
              ymin,
              xmax - xmin,
              ymax - ymin
            );
            imageCanvas.width = image1.width;
            imageCanvas.height = image1.height;
            const ctxImage = <CanvasRenderingContext2D>(
              imageCanvas.getContext("2d")
            );
            ctxImage.putImageData(image1, 0, 0);

            return Promise.resolve(imageCanvas.toDataURL("image/png"));
          })
        );
      }
    }, 1000);
  }
}
</script>
