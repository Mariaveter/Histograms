/*
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

imgElement.onload = function() {
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput', mat);
    mat.delete();
};
*/
function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

/* new */
let canvasInput = document.getElementById('canvasInput');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
    canvasInput.src = URL.createObjectURL(e.target.files[0]);
}, false);
canvasInput.onload = function() {
    let src = cv.imread('canvasInput');
    let srcNorm = cv.imread('canvasInput');
    let src1 = cv.imread('canvasInput');
    let src2 = cv.imread('canvasInput');

    /* Histogram */
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    let srcVec = new cv.MatVector();
    srcVec.push_back(src);
    let accumulate = false;
    let channels = [0];
    let histSize = [256];
    let ranges = [0, 255];
    let hist = new cv.Mat();
    let mask = new cv.Mat();
    let color = new cv.Scalar(255, 255, 255);
    let scale = 2;
    // You can try more different parameters
    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
    let result = cv.minMaxLoc(hist, mask);
    let max = result.maxVal;
    let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale,
                            cv.CV_8UC3);
    // draw histogram
    for (let i = 0; i < histSize[0]; i++) {
        let binVal = hist.data32F[i] * src.rows / max;
        let point1 = new cv.Point(i * scale, src.rows - 1);
        let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
    }


    cv.imshow('canvasOutput', dst);
    cv.imshow('canvasOutputGrey', src);
    dst.delete(); srcVec.delete(); mask.delete(); hist.delete();

    //cv.normalize(hist, hist, 0, 255, cv.NORM_MINMAX, -1, none);

    
    /* Equalize Histogram */
    //let src = cv.imread('canvasInput');
    let dstEq = new cv.Mat();
    cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(src1, dstEq);
    cv.imshow('canvasOutputEqualize', src1);
    cv.imshow('canvasOutputEqualize', dstEq);
    src1.delete(); dstEq.delete();

    /* Equalize Histogram - Image CLAHE*/

    //let src2 = cv.imread('canvasInput');

    let equalDst = new cv.Mat();
    let claheDst = new cv.Mat();
    cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(src2, equalDst);
    let tileGridSize = new cv.Size(8, 8);
    // You can try more different parameters
    let clahe = new cv.CLAHE(40, tileGridSize);
    clahe.apply(src2, claheDst);
    cv.imshow('canvasOutputEqualize2', equalDst);
    cv.imshow('canvasOutputEqualize2', claheDst);
    src2.delete(); equalDst.delete(); claheDst.delete(); clahe.delete();    
};           
