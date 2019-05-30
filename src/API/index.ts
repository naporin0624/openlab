import axios, { AxiosResponse } from "axios";
import { Prediction } from "./types";

export async function faceEmotionDetector(blob: Blob): Promise<Prediction[]> {
  // const emotionAPI = "http://192.168.88.157:5000/model/predict";
  const emotionAPI = "http://localhost:5010/model/predict";
  // const emotionAPI = "http://192.168.11.142:5000/model/predict";
  const fd = new FormData();
  fd.append("image", blob);
  const res: AxiosResponse = await axios.post(emotionAPI, fd);
  const predictions: Prediction[] = res.data.predictions;
  return Promise.resolve(predictions);
}
