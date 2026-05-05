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
  background('#fdf0d5'); // 設定畫布基礎背景顏色

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

    // 0. 繪製背景遮罩 (讓影像只出現在臉部輪廓內)
    push();
    fill('#fdf0d5');
    noStroke();
    // 繪製一個巨大的外部矩形，並在裡面扣掉臉部輪廓
    beginShape();
    vertex(-width, -height);
    vertex(width, -height);
    vertex(width, height);
    vertex(-width, height);
    beginContour();
    for (let i = faceSilhouette.length - 1; i >= 0; i--) {
      let p = face.keypoints[faceSilhouette[i]];
      let x = map(p.x, 0, 640, -vW / 2, vW / 2);
      let y = map(p.y, 0, 480, -vH / 2, vH / 2);
      vertex(x, y);
    }
    endContour();
    endShape(CLOSE);
    pop();

    noFill();

    // 1. 繪製臉部輪廓 (螢光藍色, 粗細 2)
    stroke(0, 255, 255); 
    strokeWeight(2);
    drawConnectors(face, faceSilhouette);

    // 2. 繪製黑眼圈 (眼睛外圈, 灰色偏黑, 粗細 15)
    stroke(50);
    strokeWeight(15);
    drawConnectors(face, rightEyeOuter);
    drawConnectors(face, leftEyeOuter);

    // 3. 繪製口紅 (填充外唇與內唇之間的區域)
    push();
    fill(200, 0, 50, 180); // 設定口紅顏色 (深紅，帶點透明度比較自然)
    noStroke();
    beginShape();
    // 繪製外唇輪廓
    for (let i = 0; i < lipIndices.length; i++) {
      let p = face.keypoints[lipIndices[i]];
      let x = map(p.x, 0, 640, -vW / 2, vW / 2);
      let y = map(p.y, 0, 480, -vH / 2, vH / 2);
      vertex(x, y);
    }
    // 扣除內唇區域 (beginContour 內的點需反向繞行以形成洞口)
    beginContour();
    for (let i = innerLipIndices.length - 1; i >= 0; i--) {
      let p = face.keypoints[innerLipIndices[i]];
      let x = map(p.x, 0, 640, -vW / 2, vW / 2);
      let y = map(p.y, 0, 480, -vH / 2, vH / 2);
      vertex(x, y);
    }
    endContour();
    endShape(CLOSE);
    pop();

    // 4. 繪製其餘細節線條 (紅色, 粗細 1)
    stroke(255, 0, 0);
    strokeWeight(1);
    drawConnectors(face, rightEyeInner);
    drawConnectors(face, leftEyeInner);
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
  resizeCanvas(windowWidth, windowHeight);
}
