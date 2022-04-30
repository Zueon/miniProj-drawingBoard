class DrawingBoard {
  MODE = 'NONE';
  isMouseDown = false;
  eraserColor = '#FFFFFF';
  bgColor = '#FFFFFF';
  isNaviVisible = false;
  undoArr = [];

  constructor() {
    this.assignElement();
    this.initContext();
    this.initCanvasBg();
    this.addEvent();
  }

  assignElement() {
    this.containerEl = document.getElementById('container');

    this.canvasEl = this.containerEl.querySelector('#canvas');
    this.toolbarEl = this.containerEl.querySelector('#toolbar');
    this.brushEl = this.toolbarEl.querySelector('#brush');
    this.colorPickerEl = this.toolbarEl.querySelector('#colorPicker');
    this.brushPanelEl = this.containerEl.querySelector('#brushPanel');
    this.brushSliderEl = this.brushPanelEl.querySelector('#brushSize');
    this.brushSizePreviewEl =
      this.brushPanelEl.querySelector('#brushSizePreview');
    this.eraserEl = this.toolbarEl.querySelector('#eraser');
    this.naviEl = this.toolbarEl.querySelector('#navigator');
    this.naviImgContainerEl = this.containerEl.querySelector('#imgNav');
    this.naviImgEl = this.containerEl.querySelector('#canvasImg');
    this.undoEl = this.toolbarEl.querySelector('#undo');
    this.clearEl = this.toolbarEl.querySelector('#clear');
    this.downloadEl = this.toolbarEl.querySelector('#download');
  }

  initContext() {
    this.context = this.canvasEl.getContext('2d');
  }

  initCanvasBg() {
    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }

  addEvent() {
    this.brushEl.addEventListener('click', this.onClickBrush.bind(this));
    this.canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvasEl.addEventListener('mouseout', this.onMouseOut.bind(this));
    this.brushSliderEl.addEventListener(
      'input',
      this.onChangeBrushSize.bind(this)
    );
    this.colorPickerEl.addEventListener('input', this.onChangeColor.bind(this));
    this.eraserEl.addEventListener('click', this.onClickEraser.bind(this));
    this.naviEl.addEventListener('click', this.onClickNavi.bind(this));
    this.undoEl.addEventListener('click', this.onClickUndo.bind(this));
    this.clearEl.addEventListener('click', this.onClickClear.bind(this));
    this.downloadEl.addEventListener('click', this.onClickDownload.bind(this));
  }

  onClickDownload() {
    this.downloadEl.href = this.canvasEl.toDataURL('image/jpeg', 1);
    this.downloadEl.download = 'painting.jpeg';
  }

  onClickClear() {
    this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.undoArr = [];
    this.updateNavi();
    this.initCanvasBg();
  }

  onClickUndo() {
    if (this.undoArr.length === 0) return;
    let prevDataUrl = this.undoArr.pop();
    let prevImg = new Image();
    prevImg.onload = () => {
      this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      this.context.drawImage(
        prevImg,
        0,
        0,
        this.canvasEl.width,
        this.canvasEl.height,
        0,
        0,
        this.canvasEl.width,
        this.canvasEl.height
      );
      this.updateNavi();
    };
    prevImg.src = prevDataUrl;
  }

  saveState() {
    if (this.undoArr.length > 4) {
      this.undoArr.shift();
      this.undoArr.push(this.canvasEl.toDataURL());
    } else {
      this.undoArr.push(this.canvasEl.toDataURL());
    }
    console.log(this.undoArr);
  }

  onClickNavi(event) {
    this.isNaviVisible = !event.currentTarget.classList.contains('hide');
    console.log(this.isNaviVisible);
    event.currentTarget.classList.toggle('active');
    this.naviImgContainerEl.classList.toggle('hide');
    // console.log(this.canvasEl.toDataURL());
    this.updateNavi();
  }

  updateNavi() {
    if (!this.isNaviVisible) return;
    this.naviImgEl.src = this.canvasEl.toDataURL();
  }

  onClickBrush(event) {
    const isActive = event.currentTarget.classList.contains('active');
    this.MODE = isActive ? 'NONE' : 'BRUSH';
    this.canvasEl.style.cursor = isActive ? 'default' : 'crosshair';
    this.brushPanelEl.classList.toggle('hide');
    event.currentTarget.classList.toggle('active');
    this.eraserEl.classList.remove('active');
  }

  onClickEraser(event) {
    const isActive = event.currentTarget.classList.contains('active');
    this.MODE = isActive ? 'NONE' : 'ERASER';
    this.canvasEl.style.cursor = isActive ? 'default' : 'crosshair';
    this.brushPanelEl.classList.add('hide');
    event.currentTarget.classList.toggle('active');
    this.brushEl.classList.remove('active');
  }

  onChangeBrushSize(event) {
    this.brushSizePreviewEl.style.width = `${event.target.value}px`;
    this.brushSizePreviewEl.style.height = `${event.target.value}px`;
  }

  onChangeColor(event) {
    this.brushSizePreviewEl.style.background = event.target.value;
  }

  onMouseDown(event) {
    if (this.MODE === 'NONE') return;
    this.isMouseDown = true;
    const currentPosition = this.getMousePosition(event);
    this.context.beginPath();
    this.context.moveTo(currentPosition.x, currentPosition.y);
    this.context.lineCap = 'round';
    if (this.MODE === 'BRUSH') {
      this.context.strokeStyle = this.colorPickerEl.value;
      this.context.lineWidth = this.brushSliderEl.value;
    } else if (this.MODE === 'ERASER') {
      this.context.strokeStyle = this.eraserColor;
      this.context.lineWidth = 50;
    }

    this.saveState();
    // this.context.lineTo(400, 400);
    // this.context.stroke();
  }

  onMouseMove(event) {
    if (!this.isMouseDown) return;
    const currentPosition = this.getMousePosition(event);
    this.context.lineTo(currentPosition.x, currentPosition.y);
    this.context.stroke();
  }

  onMouseUp() {
    if (this.MODE == 'NONE') return;
    this.isMouseDown = false;
    this.updateNavi();
  }

  onMouseOut() {
    if (this.MODE == 'NONE') return;
    this.isMouseDown = false;
    this.updateNavi();
  }

  getMousePosition(event) {
    const boundaries = this.canvasEl.getBoundingClientRect();
    return {
      x: event.clientX - boundaries.left,
      y: event.clientY - boundaries.top,
    };
  }
}

new DrawingBoard();
