export interface Emotion {
  label: string;
  label_id: number;
  probability: number;
}
export interface Prediction {
  detection_box: number[];
  emotion_predictions: Emotion[];
}
