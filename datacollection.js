
const handpose = require('@tensorflow-models/handpose')
require("@tensorflow/tfjs-backend-cpu");
const tf = require('@tensorflow/tfjs-core'),
    pixels = require('image-pixels'),
    fs = require('fs');
const series = require('async/series');

const data = []
const arr = ['Call_me','Good_job','Good_luck','Hello','No','Peace','Shocker','Whats_up','Yes','You']

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// calc_landmark_list
const calc_landmark_list = (landmarks,width,height) => {
  const landmark_point = landmarks.map(landmark=>(
  [Math.min((landmark[0]),width-1),Math.min((landmark[1]),height-1)]
  ))
  return landmark_point
}

// preprocessed function 
const preprocess_list = (landmark_list) =>{
  let basex = 0;
  let basey = 0;
  let temp_list = landmark_list.map((landmark,index)=>{
    if (index === 0){
      basex = landmark[0]
      basey = landmark[1]
      return [basex,basey]
    }
    return [landmark[0]-basex,landmark[1]-basey]
  })
  temp_list = temp_list.flat();
  const mx = Math.max.apply(null, temp_list);
  temp_list = temp_list.map(item=>(item/mx));
  return temp_list;
}

const main_util = (predictions , dirname) => {
  // Check if we have predictions
  if(dirname==='ZZZ'){
    console.log(data);
    console.log('trying to write to a file');
    let file = fs.createWriteStream('array.txt');
    file.on('error', function(err) { /* error handling */ });
    data.forEach(function(v) { file.write(v.join(' ') + '\n'); });
    file.end();
    console.log('done');
    return
  }
  if (predictions.length > 0) {
    // Loop through each prediction
    predictions.forEach(async(prediction) => {
      // Grab landmarks
      const landmarks = prediction.landmarks;
      // console.log(dirname);
    if(landmarks!== undefined){
        let calc = calc_landmark_list(landmarks,300,400);
        calc = [arr.indexOf(dirname),...preprocess_list(calc)];
        data.push(calc)
        console.log(JSON.stringify(calc));
        console.log(data.length);
      }
    });
  }
};


const detect = async (imagePath, model, dirname) => {
  const img = await pixels(imagePath);
  // console.log(img);
  // Load the MediaPipe handpose model.
  try {
    // console.log("Loading model ...");
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a hand prediction from the MediaPipe graph.
    model.estimateHands(img)
    .then(hands=>main_util(hands, dirname))
    .catch(error=>console.log(error))
    // console.log(hands);
  } catch (error) {
    console.log(error);
  }
  console.log('Detecting hand landmarks ...');  
  return true
}

const runHandpose = async () => {
  await tf.setBackend('cpu');
  console.log(tf.getBackend());
  series([(callback)=>{
    handpose.load().then(async(model)=>{
      fs.readdirSync("data").forEach(async name =>{  
        fs.readdirSync(`data/${name}`).forEach(async className =>{
          setTimeout(async ()=>await detect(`data/${name}/${className}`,model,name),10);
        })
      })
  })  
  }],
  )
  // handpose.load()
  // .then(async model=>{
  //   console.log("Model Loaded ...");

  //   let myPromise = new Promise(async (myResolve, myReject) => {
  //     // "Producing Code" (May take some time)
  //     await fs.readdirSync("data").forEach(async name =>{  
  //       await fs.readdirSync(`data/${name}`).forEach(async className =>{
  //         await detect(`data/${name}/${className}`,model,name)
  //       })
  //     })
  //     myResolve(true); // when successful
  //     // myReject();  // when error
  //     });
    
  //   myPromise.then(value=>{
  //   // console.log('trying to write to a file');
  //   // let file = fs.createWriteStream('array.txt');
  //   // file.on('error', function(err) { /* error handling */ });
  //   // data.forEach(function(v) { file.write(v.join(' ') + '\n'); });
  //   // file.end();
  //   // console.log('done');
  //   })
  
  // return true;
  // })
};

runHandpose()