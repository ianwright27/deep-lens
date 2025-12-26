import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import IMAGENET_CLASSES from "./imagenet_labels_array.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"

function DeepLens() {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      const loadedModel = await tf.loadGraphModel("/tfjs/model/model.json");
      setModel(loadedModel);
      console.log("Graph MobileNet loaded");
    };
    loadModel();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgUrl = URL.createObjectURL(file);
    setImage(imgUrl);
    setPredictions([]);
  };

  const preprocessImage = (imgElement) => {
    return tf.tidy(() => {
      let tensor = tf.browser.fromPixels(imgElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(127.5)
        .sub(1);
      return tensor.expandDims(0);
    });
  };

  const predict = async () => {
    if (!model || !image) return;
    const imgElement = document.getElementById("input-image");
    const inputTensor = preprocessImage(imgElement);
    const outputTensor = model.execute(inputTensor);
    const probs = outputTensor.dataSync();

    const top5 = Array.from(probs)
      .map((p, i) => ({ classId: i, probability: p, className: IMAGENET_CLASSES[i] }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    setPredictions(top5);
    tf.dispose([inputTensor, outputTensor]);
  };

  return (
    <div className="d-flex flex-column min-vh-100 min-vw-100" style={{ backgroundColor: "#f9f7ff" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#9b6fad" }}>
        <div className="container">
          <a className="navbar-brand text-white fw-bold" href="#"><strong>DeepLens</strong></a>
          <span style={{color:"#fff"}}>AI Image Detector</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container flex-grow-1 py-5">
        <div className="row d-flex">
          {/* Left Column: Image & Button */}
          <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
            {image ? (
              <img
                id="input-image"
                src={image}
                alt="uploaded"
                className="img-fluid rounded border border-secondary mb-3"
                style={{
                  width: "60%"
                }}
              />
            ) : (
              <div className="border rounded p-5 w-100 text-center text-muted" style={{ backgroundColor: "#f0efff" }}>
                Upload an image to start
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-control mt-3 mb-3"
              style={{
                width: "50%"
              }}
            />
          </div>

          {/* Right Column: Predictions */}
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <button
              className="btn btn-gradient"
              style={{ 
                position:"relative", 
                marginBottom:"25px", 
                width:"50%", 
                background: "linear-gradient(90deg, #7b5fc5, #b388eb)", 
                color: "white" }}
              onClick={predict}
            >
              Predict
            </button>
            {predictions.length > 0 && (
              <div className="card shadow-sm p-3">
                <h4 className="card-title text-purple">Top Predictions</h4>
                <ol className="list-group list-group-flush">
                  {predictions.map((p) => (
                    <li key={p.classId} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{p.className}</span>
                      <span className="badge rounded-pill" style={{ backgroundColor: "#b388eb", color: "white" }}>
                        {(p.probability * 100).toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3" style={{ backgroundColor: "#cfc3d4", color: "black" }}>
        @ianwright27
      </footer>
    </div>
  );
}

export default DeepLens;
