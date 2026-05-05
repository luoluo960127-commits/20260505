let capture;
let faceMesh;
let faces = [];
// 指定要串接的臉部編號 (唇部外輪廓)
let lipIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 指定要串接的臉部編號 (內唇輪廓)
let innerLipIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
// 右眼索引 (247外圍圈與246內圈)
let rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
let rightEyeInner = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
// 左眼索引 (對應內外圈)
let leftEyeOuter = [463, 341, 256, 252, 253, 254, 339, 255, 359, 467, 260, 259, 257, 258, 286, 414];
let leftEyeInner = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
// 臉部最外層輪廓
let faceSilhouette = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480); // 設定攝影機解析度以利辨識
  capture.hide(); 

  // 初始化 FaceMesh 模型
  faceMesh = ml5.faceMesh(capture, { maxFaces: 1, flipped: false }, () => {
    console.log("FaceMesh Model Loaded");
  });

  // 開始持續辨識臉部
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });

  imageMode(CENTER); // 設定影像繪製模式為中心
}

function draw() {
  background('#e7c6ff'); // 設定背景顏色

  // 設定顯示影像的尺寸 (整個畫布寬高的 50%)
  let vW = width * 0.5;
  let vH = height * 0.5;

  // 1. 顯示文字：教科414730217 (置中於畫布上方，獨立於 push/pop 之外不受鏡像翻轉影響)
  fill(0); 
  noStroke(); 
  textSize(32); 
  textAlign(CENTER, CENTER); 
  text("教科414730217", width / 2, (height - vH) / 4); 

  // 2. 繪製攝影機影像與嘴部辨識線段
  push();
  translate(width / 2, height / 2); // 移動到畫布中心
  scale(-1, 1); // 左右顛倒處理 (鏡像)
  image(capture, 0, 0, vW, vH); // 繪製影像

  // 檢查是否有偵測到臉部
  if (faces.length > 0) {
    let face = faces[0];
    noFill();

    // 0. 繪製臉部輪廓 (藍色, 粗細 2)
    stroke(0, 0, 255);
    strokeWeight(2);
    drawConnectors(face, faceSilhouette);

    // 設定眼睛與嘴唇的樣式 (紅色, 粗細 1)
    stroke(255, 0, 0);
    strokeWeight(1);

    // 1. 繪製右眼 (247外圍圈與246內圈)
    drawConnectors(face, rightEyeOuter);
    drawConnectors(face, rightEyeInner);

    // 2. 繪製左眼 (內外圈)
    drawConnectors(face, leftEyeOuter);
    drawConnectors(face, leftEyeInner);

    // 3. 繪製嘴唇 (保留部分)
    drawConnectors(face, lipIndices);
    drawConnectors(face, innerLipIndices);
  }
  pop();
}

function drawConnectors(face, indices) {
  let vW = width * 0.5;
  let vH = height * 0.5;
  for (let i = 0; i < indices.length; i++) {
    let p1 = face.keypoints[indices[i]];
    let p2 = face.keypoints[indices[(i + 1) % indices.length]];
    if (p1 && p2) {
      let x1 = map(p1.x, 0, 640, -vW / 2, vW / 2);
      let y1 = map(p1.y, 0, 480, -vH / 2, vH / 2);
      let x2 = map(p2.x, 0, 640, -vW / 2, vW / 2);
      let y2 = map(p2.y, 0, 480, -vH / 2, vH / 2);
      line(x1, y1, x2, y2);
    }
  }
}

function windowResized() {
    // 1. 利用 line 指令串接外唇編號點
    for (let i = 0; i < lipIndices.length; i++) {
      let p1 = face.keypoints[lipIndices[i]];
      let p2 = face.keypoints[lipIndices[(i + 1) % lipIndices.length]]; // 閉合嘴唇迴圈

      if (p1 && p2) {
        // 使用固定尺寸 640x480 映射，避免 capture.width 尚未初始化導致 NaN
        let x1 = map(p1.x, 0, 640, -vW / 2, vW / 2);
        let y1 = map(p1.y, 0, 480, -vH / 2, vH / 2);
        let x2 = map(p2.x, 0, 640, -vW / 2, vW / 2);
        let y2 = map(p2.y, 0, 480, -vH / 2, vH / 2);
        line(x1, y1, x2, y2);
      }
    }

    // 2. 利用 line 指令串接內唇編號點
    for (let i = 0; i < innerLipIndices.length; i++) {
      let p1 = face.keypoints[innerLipIndices[i]];
      let p2 = face.keypoints[innerLipIndices[(i + 1) % innerLipIndices.length]]; // 閉合嘴唇迴圈

      if (p1 && p2) {
        let x1 = map(p1.x, 0, 640, -vW / 2, vW / 2);
        let y1 = map(p1.y, 0, 480, -vH / 2, vH / 2);
        let x2 = map(p2.x, 0, 640, -vW / 2, vW / 2);
        let y2 = map(p2.y, 0, 480, -vH / 2, vH / 2);
        line(x1, y1, x2, y2);
      }
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
