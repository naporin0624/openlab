<template>
  <div class="wrapper">
    <v-container>
      <v-layout wrap align-center justify-center row fill-height>
        <v-flex md6 xs12 ref="videobox">
          <div class="video-box" v-show="isVideoRender">
            <video
              ref="video"
              loop
              :autoplay="isFaceRecognitionStart"
              @click="toggleFaceEmotionRecognition"
            ></video>

            <v-btn
              dark
              v-if="isVideoRender && !isFaceRecognitionStart"
              @click.end="toggleFaceEmotionRecognition"
              fab
              flat
              large
              :style="{
                top: (videoElem.width * 9) / 32 - 36 + 'px',
                left: videoElem.width / 2 - 36 + 'px'
              }"
            >
              <v-icon dark>play_circle_outline</v-icon>
            </v-btn>
          </div>
          <canvas ref="canvas" style="display: none"></canvas>
          <canvas ref="draw" style="display: none"></canvas>
          <canvas ref="image" style="display: none"></canvas>
          <v-container>
            <v-layout wrap align-center justify-center row fill-height>
              <v-flex md4 v-for="(imgsrc, idx) in personImage" :key="idx">
                <v-img
                  width="160"
                  height="160"
                  :src="imgsrc"
                  style="margin: auto; transform: scaleX(-1);"
                  :style="{ border: 'solid 5px ' + colorList[idx] }"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex md6 xs12 v-show="isVideoRender">
          <RaderChart
            :chartData="chartData"
            :chartOption="chartOption"
          ></RaderChart>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style scoped>
.video-box {
  position: relative;
}
.video-box .v-btn {
  position: absolute;
}
video {
  transform: scaleX(-1);
  border: solid 5px rgb(100, 100, 100);
  background-color: rgba(100, 100, 100, 0.3);
}
</style>

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
  public videoElem?: HTMLVideoElement;
  public isVideoRender: boolean = false;
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
    this.videoElem = <HTMLVideoElement>this.$refs.video;
    const videoBox = <HTMLVideoElement>this.$refs.videobox;
    this.videoElem.srcObject = stream;
    this.videoElem.width = videoBox.clientWidth;
    this.isVideoRender = true;
  }

  beforeDestroy() {
    if (this.videoElem) {
      let stream: any = this.videoElem.srcObject;
      let tracks: any = stream.getTracks();

      tracks.forEach((track: any) => {
        track.stop();
      });

      this.videoElem.srcObject = null;
    }
  }

  // btnAction
  public toggleFaceEmotionRecognition(): void {
    if (this.isFaceRecognitionStart) {
      this.isFaceRecognitionStart = false;
      if (this.videoElem) {
        this.videoElem.pause();
      }
    } else {
      this.isFaceRecognitionStart = true;
      if (this.videoElem) {
        this.videoElem.play();
        this.faceEmotionRecognitionPerSec();
      }
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
