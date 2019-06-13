import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Options, ChangeContext } from 'ng5-slider';
import * as posenet from '@tensorflow-models/posenet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public architectureArray: Array<object> = [
    { 'name': 'MobileNet V1', 'value': 'MobileNetV1' },
    { 'name': 'ResNet 50', 'value': 'ResNet50' }
  ];
  public architecture: any = 'MobileNetV1';
  public multiplierArray: Array<number> = [ 1.01, 1.00, 0.75, 0.50 ];
  public multiplier: any = 0.75;
  public outputStrideArc1Array: Array<number> = [ 8, 16 ];
  public outputStrideArc2Array: Array<number> = [ 16, 32 ];
  public outputStride: any = 16;
  public inputResolutionArc1Array: Array<number> = [ 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513 ];
  public inputResolutionArc2Array: Array<number> = [ 257, 513 ];
  public inputResolution: any = 257;
  public quantBytesArray: Array<number> = [ 1, 2, 4 ];
  public quantBytes: any = 1;
  public poseArray: Array<object> = [
    { 'name': 'Single Person', 'value': 'single-person' },
    { 'name': 'Multi Person', 'value': 'multi-person' }
  ];
  public pose: string = 'single-person';
  public singlePose: any;
  public multiplePose: any;
  public flipHorizontal: any = false;
  public drawKeypoints: any = false;
  public drawSkeleton: any = false;
  public drawBoundingBox: any = false;
  public scoreThresholdOptions: Options = {
    floor: 0.0,
    ceil: 1,
    step: 0.1,
    showSelectionBar: true
  };
  public scoreThreshold: any = 0.5;
  public nmsRadiusOptions: Options = {
    floor: 1,
    ceil: 50,
    step: 1,
    showSelectionBar: true
  };
  public nmsRadius: any = 20;
  public model: any;
  public modelLoaded: boolean = false;
  public title: string = 'Human Pose Estimation';
  public introline: string = '(using TensorFlow.js with PoseNet Model)';
  public modelText: string = 'Select Model';
  public imgBtnStatus: boolean = true;
  public webBtnStatus: boolean = false;
  public imageElement: any;
  public imageSrc: any = 'assets/backpackman.jpg';
  public imageWidth: number = 410;
  public imageHeight: number = 310;
  @ViewChild('videoElement', {static: false}) videoElement: ElementRef;
  public video: any;
  public videoWidth: number = 410;
  public videoHeight: number = 310;
  public videoStream: any;
  public canvas: any;
  public canvasWidth: number = 400;
  public canvasHeight: number = 300;
  public canvasContext: any;
  @ViewChild("videoCanvas", {static: false}) videoCanvas: ElementRef;
  public maxPoseDetections: any = 5;
  public fileName: string = 'No File Chosen';
  public fileError: boolean = false;
  public animationFrame: any;
  public videoPic: any = false;
  public snapData: any;
  public videoCanvasEnable: boolean = false;

  public async ngOnInit() {
    this.model = await posenet.load();
    this.modelLoaded = true;
    setTimeout(() => {
      this.setSliderConfig();
    }, 1000);
  }

  public imageMode() {
    if (this.webBtnStatus) {
      this.stopVideo();
      cancelAnimationFrame(this.animationFrame);
      this.videoCanvasEnable = false;
      this.imageSrc = '';
      this.imageSrc = 'assets/white.jpg';
      this.imgBtnStatus = true;
      this.webBtnStatus = false;
      this.snapData = null;
      this.canvas = document.getElementById("canvas");
      this.canvasContext = this.canvas.getContext("2d");
      this.canvasContext.clearRect(0, 0, 400, 300);
    }
  }

  public videoMode() {
    if (this.imgBtnStatus) {
      cancelAnimationFrame(this.animationFrame);
      this.videoCanvasEnable = false;
      this.fileName = 'No File Chosen';
      this.imageSrc = 'assets/white.jpg';
      this.webBtnStatus = true;
      this.imgBtnStatus = false;
      this.snapData = null;
      this.video = this.videoElement.nativeElement;
      this.initCamera({ video: true, audio: false });
      this.canvas = document.getElementById("canvas");
      this.canvasContext = this.canvas.getContext("2d");
      this.canvasContext.clearRect(0, 0, 400, 300);
    }
  }

  public initCamera(config:any) {
    let browser = <any>navigator;
    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);
    browser.mediaDevices.getUserMedia(config).then((stream: any) => {
      if(!stream.stop && stream.getTracks) {
        stream.stop = function(){
          this.getTracks().forEach(function (track: any) {
            track.stop();
          });
        };
      }
      this.videoStream = stream;
      try {
        this.video.srcObject = this.videoStream;
      } catch(err) {
        this.video.src = window.URL.createObjectURL(this.videoStream);
      }
      this.video.play();
    });
  }

  public stopVideo() {
    this.videoStream.stop();
  }

  public setSliderConfig() {
    this.scoreThresholdOptions = {
      floor: 0.0,
      ceil: 1,
      step: 0.1,
      showSelectionBar: true
    };
    this.scoreThreshold = this.scoreThreshold;
    this.nmsRadiusOptions = {
      floor: 1,
      ceil: 50,
      step: 1,
      showSelectionBar: true
    };
    this.nmsRadius = this.nmsRadius;
  }

  public snapPhoto() {
    this.videoCanvasEnable = false;
    setTimeout(async () => {
      await cancelAnimationFrame(this.animationFrame);
      this.canvas = await document.getElementById("canvas");
      this.canvasContext = await this.canvas.getContext("2d");
      await this.canvasContext.clearRect(0, 0, 400, 300);
      if (!this.videoPic) {
        this.videoPic = true;
        await this.canvasContext.drawImage(this.videoElement.nativeElement, 0, 0, this.canvasWidth, this.canvasHeight);
        this.snapData = await this.canvasContext.getImageData(0, 0, 400, 300);
      } else {
        await this.canvasContext.putImageData(this.snapData, 0, 0);
      }
      if (this.model) {
        setTimeout(async () => {
          if (this.pose === 'single-person') {
            this.singlePose = await this.model.estimatePoses(this.canvas, {
              flipHorizontal: this.flipHorizontal,
              decodingMethod: 'single-person'
            });
            this.drawSinglePoseResult();
          } else {
            this.multiplePose = await this.model.estimatePoses(this.canvas, {
              flipHorizontal: this.flipHorizontal,
              decodingMethod: 'multi-person',
              maxPoseDetections: this.maxPoseDetections,
              scoreThreshold: this.scoreThreshold,
              nmsRadius: this.nmsRadius
            });
            this.drawMultiPoseResult();
          }
        }, 1000);
      }
    }, 500);
  }

  public async realTimeVideo() {
    this.videoPic = false;
    if (this.videoCanvasEnable) {
      if (this.pose === 'single-person') {
        this.singlePose = await this.model.estimatePoses(this.video, {
          flipHorizontal: this.flipHorizontal,
          decodingMethod: 'single-person'
        });
        this.renderSinglePoseResult();
      } else {
        this.multiplePose = await this.model.estimatePoses(this.video, {
          flipHorizontal: this.flipHorizontal,
          decodingMethod: 'multi-person',
          maxPoseDetections: this.maxPoseDetections,
          scoreThreshold: this.scoreThreshold,
          nmsRadius: this.nmsRadius
        });
        this.renderMultiPoseResult();
      }
      this.animationFrame = requestAnimationFrame(() => {
        this.realTimeVideo();
      });
    }
  }

  public async selectArchitecture(architecture: any) {
    this.modelText = architecture['name'];
  }

  public selectOutputStride(outputStride: any) {
    this.outputStride = outputStride;
  }

  public selectInputResolution(inputResolution: any) {
    this.inputResolution = inputResolution;
  }

  public selectMultiplier(multiplier: any) {
    this.multiplier = multiplier;
  }

  public selectQuantBytes(quantBytes: any) {
    this.quantBytes = quantBytes;
  }

  public async loadModel() {
    this.canvas = document.getElementById("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.clearRect(0, 0, 400, 300);
    let outputStride: any = parseInt(this.outputStride);
    let inputResolution: any = parseInt(this.inputResolution);
    let multiplier: any = parseFloat(this.multiplier);
    let quantBytes: any = parseInt(this.quantBytes);
    if (this.modelText === 'MobileNet V1') {
      this.modelLoaded = false;
      this.model = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: outputStride,
        inputResolution: inputResolution,
        multiplier: multiplier
      });
      this.modelLoaded = true;
      setTimeout(() => {
        this.setSliderConfig();
        if (this.pose === 'single-person') {
          this.estimatePose();
        } else {
          this.estimatePoses();
        }
      }, 1000);
    } else if (this.modelText === 'ResNet 50') {
      this.modelLoaded = false;
      this.model = await posenet.load({
        architecture: 'ResNet50',
        outputStride: outputStride,
        inputResolution: inputResolution,
        quantBytes: quantBytes
      });
      this.modelLoaded = true;
      setTimeout(() => {
        this.setSliderConfig();
        if (this.pose === 'single-person') {
          this.estimatePose();
        } else {
          this.estimatePoses();
        }
      }, 1000);
    }
  }

  public changePose(pose: string) {
    this.pose = pose;
    if (this.imgBtnStatus) {
      if (pose === 'single-person') {
        this.estimatePose();
      } else {
        this.estimatePoses();
      }
    } else {
      if (this.videoPic) {
        this.snapPhoto();
      } else {
        this.realTimeVideo();
      }
    }
  }

  public onDrawBoundingBoxChanged() {
    this.drawBoundingBox = !this.drawBoundingBox;
    if (this.imgBtnStatus) {
      if (this.pose === 'single-person') {
        this.estimatePose();
      } else {
        this.estimatePoses();
      }
    } else {
      if (this.videoPic) {
        this.snapPhoto();
      } else {
        this.realTimeVideo();
      }
    }
  }

  public onKeypointsChanged() {
    this.drawKeypoints = !this.drawKeypoints;
    if (this.imgBtnStatus) {
      if (this.pose === 'single-person') {
        this.estimatePose();
      } else {
        this.estimatePoses();
      }
    } else {
      if (this.videoPic) {
        this.snapPhoto();
      } else {
        this.realTimeVideo();
      }
    }
  }

  public onSkeletonChanged() {
    this.drawSkeleton = !this.drawSkeleton;
    if (this.imgBtnStatus) {
      if (this.pose === 'single-person') {
        this.estimatePose();
      } else {
        this.estimatePoses();
      }
    } else {
      if (this.videoPic) {
        this.snapPhoto();
      } else {
        this.realTimeVideo();
      }
    }
  }

  public onFlipHorizontalChanged() {
    this.flipHorizontal = !this.flipHorizontal;
    if (this.imgBtnStatus) {
      if (this.pose === 'single-person') {
        this.estimatePose();
      } else {
        this.estimatePoses();
      }
    } else {
      if (this.videoPic) {
        this.snapPhoto();
      } else {
        this.realTimeVideo();
      }
    }
  }

  public increaseMaxPoseDetections() {
    if (this.imgBtnStatus) {
      if (this.pose === 'multi-person') {
        this.maxPoseDetections++;
        this.estimatePoses();
      }
    } else {
      if (!this.videoPic) {
        this.realTimeVideo();
      }
    }
  }

  public decreaseMaxPoseDetections() {
    if (this.imgBtnStatus) {
      if (this.pose === 'multi-person') {
        this.maxPoseDetections--;
        this.estimatePoses();
      }
    } else {
      if (!this.videoPic) {
        this.realTimeVideo();
      }
    }
  }

  public onScoreThresholdChanged(changeContext: ChangeContext) {
    if (this.imgBtnStatus) {
      if (this.pose === 'multi-person') {
        this.scoreThreshold = changeContext['value'];
        this.estimatePoses();
      }
    } else {
      if (!this.videoPic) {
        this.realTimeVideo();
      }
    }
  }

  public onNmsRadiusChanged(changeContext: ChangeContext) {
    if (this.imgBtnStatus) {
      if (this.pose === 'multi-person') {
        this.nmsRadius = changeContext['value'];
        this.estimatePoses();
      }
    } else {
      if (!this.videoPic) {
        this.realTimeVideo();
      }
    }
  }

  public estimate() {
    if (this.pose === 'single-person') {
      this.estimatePose();
    } else {
      this.estimatePoses();
    }
  }

  public async estimatePose() {
    this.imageElement = await document.getElementById('image');
    this.singlePose = await this.model.estimatePoses(this.imageElement, {
      flipHorizontal: this.flipHorizontal,
      decodingMethod: 'single-person'
    });
    this.canvas = document.getElementById("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.clearRect(0, 0, 400, 300);
    this.canvasContext.drawImage(this.imageElement, 0, 0, 400, 300);
    this.drawSinglePoseResult();
  }

  public async drawSinglePoseResult() {
    if (this.drawKeypoints) {
      this.singlePose[0]['keypoints'].forEach((points: any) => {
        this.canvasContext.beginPath();
        this.canvasContext.fillStyle = 'aqua';
        this.canvasContext.arc(points['position']['x'], points['position']['y'], 3, 0, Math.PI*2, true);
        this.canvasContext.closePath();
        this.canvasContext.fill();
      });
    }
    if (this.drawSkeleton) {
      let adjacentKeyPoints = await posenet.getAdjacentKeyPoints(this.singlePose[0]['keypoints'], 0.5);
      for(let i = 0; i < adjacentKeyPoints.length; i++) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(adjacentKeyPoints[i][0]['position']['x'], adjacentKeyPoints[i][0]['position']['y']);
        this.canvasContext.lineTo(adjacentKeyPoints[i][1]['position']['x'], adjacentKeyPoints[i][1]['position']['y']);
        this.canvasContext.lineWidth = 2;
        this.canvasContext.strokeStyle = 'aqua';
        this.canvasContext.stroke();
      }
    }
    if(this.drawBoundingBox) {
      let boundingBox = posenet.getBoundingBox(this.singlePose[0]['keypoints']);
      this.canvasContext.beginPath();
      this.canvasContext.strokeStyle = 'red';
      this.canvasContext.rect(boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX, boundingBox.maxY - boundingBox.minY);
      this.canvasContext.stroke();
    }
  }

  public async renderSinglePoseResult() {
    try {
      this.canvas = document.getElementById("videoCanvas");
      this.canvasContext = this.canvas.getContext("2d");
      this.canvasContext.drawImage(this.videoElement.nativeElement, 0, 0, this.canvasWidth, this.canvasHeight);
      this.drawSinglePoseResult();
    } catch(e) { }
  }

  public async estimatePoses() {
    this.multiplePose = await this.model.estimatePoses(this.imageElement, {
      flipHorizontal: this.flipHorizontal,
      decodingMethod: 'multi-person',
      maxPoseDetections: this.maxPoseDetections,
      scoreThreshold: this.scoreThreshold,
      nmsRadius: this.nmsRadius
    });
    this.canvas = document.getElementById("canvas");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvasContext.clearRect(0, 0, 400, 300);
    this.canvasContext.drawImage(this.imageElement, 0, 0, 400, 300);
    this.drawMultiPoseResult();
  }

  public async drawMultiPoseResult() {
    for(let j = 0; j < this.multiplePose.length; j++) {
      if(this.drawKeypoints) {
        this.multiplePose[j]['keypoints'].forEach((points: any) => {
          this.canvasContext.beginPath();
          this.canvasContext.fillStyle = 'aqua';
          this.canvasContext.arc(points['position']['x'], points['position']['y'], 3, 0, Math.PI*2, true);
          this.canvasContext.closePath();
          this.canvasContext.fill();
        });
      }
      if(this.drawSkeleton) {
        let adjacentKeyPoints = await posenet.getAdjacentKeyPoints(this.multiplePose[j]['keypoints'], 0.5);
        for(let i = 0; i < adjacentKeyPoints.length; i++) {
          this.canvasContext.beginPath();
          this.canvasContext.moveTo(adjacentKeyPoints[i][0]['position']['x'], adjacentKeyPoints[i][0]['position']['y']);
          this.canvasContext.lineTo(adjacentKeyPoints[i][1]['position']['x'], adjacentKeyPoints[i][1]['position']['y']);
          this.canvasContext.lineWidth = 2;
          this.canvasContext.strokeStyle = 'aqua';
          this.canvasContext.stroke();
        }
      }
      if(this.drawBoundingBox) {
        let boundingBox = posenet.getBoundingBox(this.multiplePose[j]['keypoints']);
        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = 'red';
        this.canvasContext.rect(boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX,
          boundingBox.maxY - boundingBox.minY);
        this.canvasContext.stroke();
      }
    }
  }

  public async renderMultiPoseResult() {
    try {
      this.canvas = document.getElementById("videoCanvas");
      this.canvasContext = this.canvas.getContext("2d");
      this.canvasContext.drawImage(this.videoElement.nativeElement, 0, 0, this.canvasWidth, this.canvasHeight);
      this.drawMultiPoseResult();
    } catch(e) { }
  }

  public browseFile(files: any) {
    if (files.length === 0) {
      return;
    } else {
      let mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.fileError = true;
        return;
      } else {
        this.fileError = false;
        this.fileName = files[0].name;
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          this.imageSrc = reader.result;
        }
      }
    }
  }

}
