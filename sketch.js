let capture;
let faceMesh;
let faces = [];
// 指定要串接的臉部編號 (唇部外輪廓)
let lipIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
// 指定要串接的臉部編號 (內唇輪廓)
let innerLipIndices = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

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

  if (faces.length > 0 && capture.width > 0) {
    let face = faces[0];
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(1);   // 線條粗細改為 1
    noFill();

    // 1. 利用 line 指令串接外唇編號點
    for (let i = 0; i < lipIndices.length; i++) {
      let p1 = face.keypoints[lipIndices[i]];
      let p2 = face.keypoints[lipIndices[(i + 1) % lipIndices.length]]; // 閉合嘴唇迴圈

      if (p1 && p2) {
        // 將影片原始座標映射至畫布上影像的大小範圍 (-vW/2 到 vW/2)
        let x1 = map(p1.x, 0, capture.width, -vW / 2, vW / 2);
        let y1 = map(p1.y, 0, capture.height, -vH / 2, vH / 2);
        let x2 = map(p2.x, 0, capture.width, -vW / 2, vW / 2);
        let y2 = map(p2.y, 0, capture.height, -vH / 2, vH / 2);
        line(x1, y1, x2, y2);
      }
    }

    // 2. 利用 line 指令串接內唇編號點
    for (let i = 0; i < innerLipIndices.length; i++) {
      let p1 = face.keypoints[innerLipIndices[i]];
      let p2 = face.keypoints[innerLipIndices[(i + 1) % innerLipIndices.length]]; // 閉合嘴唇迴圈

      if (p1 && p2) {
        let x1 = map(p1.x, 0, capture.width, -vW / 2, vW / 2);
        let y1 = map(p1.y, 0, capture.height, -vH / 2, vH / 2);
        let x2 = map(p2.x, 0, capture.width, -vW / 2, vW / 2);
        let y2 = map(p2.y, 0, capture.height, -vH / 2, vH / 2);
        line(x1, y1, x2, y2);
      }
    }
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
