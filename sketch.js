let capture;

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.hide(); // 隱藏預設的影片元件
  imageMode(CENTER); // 設定影像繪製模式為中心
}

function draw() {
  background('#e7c6ff'); // 設定背景顏色

  let vW = width * 0.5;  // 畫布寬度的 50%
  let vH = height * 0.5; // 畫布高度的 50%

  push();
  translate(width / 2, height / 2); // 移動到畫布中心
  scale(-1, 1); // 左右顛倒處理 (水平鏡像)
  image(capture, 0, 0, vW, vH); // 繪製影像
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
