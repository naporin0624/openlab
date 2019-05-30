import axios, { AxiosResponse } from "axios";
import { Prediction } from "./types";

export async function faceEmotionDetector(files: Blob): Promise<Prediction[]> {
  const emotionAPI = "http://localhost:5001/model/predict";
  const fd = new FormData();
  fd.append("image", files);
  const res: AxiosResponse = await axios.post(emotionAPI, fd);
  const predictions: Prediction[] = res.data;
  return Promise.resolve(predictions);
}
