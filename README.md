# Human Pose Estimation (using TensorFlow.js with PoseNet Model)  ![Version][version-image]

![Linux Build][linuxbuild-image]
![Windows Build][windowsbuild-image]
![NSP Status][nspstatus-image]
![Test Coverage][coverage-image]
![Dependency Status][dependency-image]
![devDependencies Status][devdependency-image]

The quickest way to get start with Human Pose Estimation (using TensorFlow.js with PoseNet Model), just clone the project:

```bash
$ git clone https://github.com/arjunkhetia/Human-Pose-Estimation.git
```

Install dependencies:

```bash
$ npm install
```

Start the angular app at `http://localhost:4200/`:

```bash
$ npm start
```

## TensorFlow.js

[TensorFlow](https://www.tensorflow.org) is an open source software library for numerical computation using data flow graphs. The graph nodes represent mathematical operations, while the graph edges represent the multidimensional data arrays (tensors) that flow between them. [TensorFlow.js](https://www.tensorflow.org/js) is a library for developing and training ML models in JavaScript, and deploying in browser or on Node.js.

```ts
import * as tfjs from '@tensorflow/tfjs';
```

## PoseNet

PoseNet can be used to estimate either a single pose or multiple poses, meaning there is a version of the algorithm that can detect only one person in an image/video and one version that can detect multiple persons in an image/video.

This TensorFlow.js model does not require you to know about machine learning. It can take as input any browser-based image elements (<img>, <video>, <canvas> elements, for example) and returns an array of most likely predictions and their confidences.


```ts
// Loads MobileNetV1 based PoseNet
const net = await posenet.load({
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: 513,
  multiplier: 0.75
});
```

```ts
/// Loads ResNet based PoseNet
const net = await posenet.load({
  architecture: 'ResNet50',
  outputStride: 32,
  inputResolution: 257,
  quantBytes: 2
});
```

### Sinple Person Detection

```ts
import * as posenet from '@tensorflow-models/posenet';

async function estimatePoseOnImage(imageElement) {
  // load the posenet model from a checkpoint
  const net = await posenet.load();

  const poses = await net.estimatePoses(imageElement, {
    flipHorizontal: false,
    decodingMethod: 'single-person'
  });
  const pose = poses[0]
  return pose;
}

const imageElement = document.getElementById('cat');

const pose = estimatePoseOnImage(imageElement);

console.log(pose);
```

### Multi Person Detection

```ts
import * as posenet from '@tensorflow-models/posenet';

async function estimateMultiplePosesOnImage(imageElement) {
  const net = await posenet.load();

  // estimate poses
  const poses = await net.estimatePoses(imageElement, {
        flipHorizontal: false,
        maxPoseDetections: 2,
        scoreThreshold: 0.6,
        nmsRadius: 20});

  return poses;
}

const imageElement = document.getElementById('people');

const poses = estimateMultiplePosesOnImage(imageElement);

console.log(poses);
```

# Image Mode -

### Single Person with Keypoints
![1](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/1.png "1")

### Single Person with Keypoints & Skeleton
![2](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/2.png "2")

### Single Person with Keypoints, Skeleton & Bounding Box
![3](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/3.png "3")

### Multi Person with Keypoints & Skeleton
![4](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/4.png "4")

### Multi Person with Keypoints, Skeleton & Bounding Box
![5](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/5.png "5")

# Video Mode -

### Single Person with Keypoints & Skeleton
![6](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/6.png "6")

### Single Person with Keypoints, Skeleton & Bounding Box
![7](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/7.png "7")

# ResNet based PoseNet Model (high estimation accuracy) -

### Single Person with Keypoints & Skeleton
![8](https://github.com/arjunkhetia/Human-Pose-Estimation/blob/master/src/assets/8.png "8")

[version-image]: https://img.shields.io/badge/Version-1.0.0-orange.svg
[linuxbuild-image]: https://img.shields.io/badge/Linux-passing-brightgreen.svg
[windowsbuild-image]: https://img.shields.io/badge/Windows-passing-brightgreen.svg
[nspstatus-image]: https://img.shields.io/badge/nsp-no_known_vulns-blue.svg
[coverage-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[dependency-image]: https://img.shields.io/badge/dependencies-up_to_date-brightgreen.svg
[devdependency-image]: https://img.shields.io/badge/devdependencies-up_to_date-yellow.svg
