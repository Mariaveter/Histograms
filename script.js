// Функція для перетворення кольору з RGB у відтінки сірого
function RGBToGray(r, g, b)
{
    // Середнє значення
    //return Math.round((r + g + b) / 3);
    // Стандарт TV: Y'=0.299R+0.587G+0.114B
    //return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    // Стандарт HDTV: Y'=0.2126R+0.7152G+0.0722B
    return Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
}

// Функція для перетворення масиву пікселів з RGBA у відтінки сірого
function RGBArrayToGray(pixels)
{
    let result = new Uint8ClampedArray(pixels.length);
    for (let i = 0, l = pixels.length; i < l; i += 4)
    {
        let gray = RGBToGray(pixels[i], pixels[i + 1], pixels[i + 2]);
        for (let j = i; j < i + 3; j++) {
            result[j] = gray; // Записуємо в кожен субпіксель обчислене значення яскравості
        }
        result[i + 3] = pixels[i + 3]; // Альфа-канал
    }
    return result;
}

// Функція для підрахунку пікселів кожної яскравості
function countPixels(pixels, channel)
{
    let offset; // Номер субпікселя
    switch (channel)
    {
        case 'red':
            offset = 0;
            break;
        case 'green':
            offset = 1;
            break;
        case 'blue':
            offset = 2;
            break;
        case 'alpha':
            offset = 3;
            break;
        default:
            offset = -1; // Відтінки сірого
    }
    let counter = new Array(256); // Кількість пікселів для кожного з 256 рівнів яскравості
    counter.fill(0);
    for (let i = 0, l = pixels.length; i < l; i += 4) {
        let level = offset >= 0 ? pixels[i + offset] : RGBToGray(pixels[i], pixels[i + 1], pixels[i + 2]);
        counter[level]++;
    }
    return counter;
}

// Допоміжні функції
function arrayMax(array)
{
    let max = 0;
    for (let i = 0, l = array.length; i < l; i++) {
        if (array[i] > max) {
            max = array[i];
        }
    };
    return max;
}

function arrayScale(array, scale)
{
    let result = new Array(array.length);
    for (let i = 0, l = array.length; i < l; i++) {
        result[i] = Math.round(scale * array[i]);
    }
    return result;
}

function arrayNormalize(array, height)
{
    let max = arrayMax(array);
    if (max > 0) {
        let scale = height / max; // Коефіцієнт масштабування
        return arrayScale(array, scale);
    }
    return array;
}

// Повертає дані гістограми для заданого масиву пікселів
function buildHistogram(pixels, normalize)
{
    let result = countPixels(pixels);
    if (normalize) {
        return arrayNormalize(result, normalize);
    }
    return result;
}

// Повертає дані гістограми каналів для заданого масиву пікселів
function buildRGBHistogram(pixels, normalize)
{
    let channels = ['red', 'green', 'blue'];
    let result = {};
    for (let i in channels) {
        result[channels[i]] = countPixels(pixels, channels[i]);
    }
    if (normalize) {
        let max = 0;
        for (let i in channels) {
            max = Math.max(max, arrayMax(result[channels[i]]));
        }
        if (max > 0) {
            let scale = normalize / max; // Коефіцієнт масштабування
            for (let i in channels) { // Пропорційно масштабуємо всі канали
                result[channels[i]] = arrayScale(result[channels[i]], scale);
            }
        }
    }
    return result;
}

// Функція для малювання даних гістограми на елементі Canvas
function drawHistogram(data, canvasOutput)
{
    let height = 256;
    let canvas = document.createElement('canvas');
    // Почакові розміри, при виведенні зображення масштабується
    canvas.width = data.length;
    canvas.height = height;
    let context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white'; // Колір фону
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black'; // Колір стовпчиків
    for (let i = 0, l = data.length; i < l; i++) {
        context.fillRect(i, height - data[i], 1, data[i]);
    }
    let outputContext = canvasOutput.getContext('2d');
    outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasOutput.width, canvasOutput.height);
}

// Функція для малювання гістограми зображення на елементі Canvas
function customHistogram(imageInput, canvasOutput)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let histogram = buildHistogram(pixels, 256); // Дані гістограми
    drawHistogram(histogram, canvasOutput); // Виведення гістограми на канву
}

// Функція для малювання даних RGB гістограми на елементі Canvas
function drawRGBHistogram(data, canvasOutput)
{
    let height = 256;
    let canvas = document.createElement('canvas');
    // Почакові розміри, при виведенні зображення масштабується
    canvas.width = 256;
    canvas.height = height;
    let context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white'; // Колір фону
    context.fillRect(0, 0, canvas.width, canvas.height);
    let channels = ['red', 'green', 'blue'];
    for (let i in channels) {
        let channel = data[channels[i]];
        context.strokeStyle = channels[i]; // Колір діаграми відповідає каналу
        context.beginPath();
        context.moveTo(0, height - channel[0])
        for (let i = 1, l = channel.length; i < l; i++) {
            context.lineTo(i, height - channel[i]);
        }
        context.stroke();
    }
    let outputContext = canvasOutput.getContext('2d');
    outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasOutput.width, canvasOutput.height);
}

// Функція для малювання RGB гістограми зображення на елементі Canvas
function customRGBHistogram(imageInput, canvasOutput)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let histogram = buildRGBHistogram(pixels, 256); // Дані гістограми
    drawRGBHistogram(histogram, canvasOutput); // Виведення гістограми на канву
}

// Функція для перетворення зображення у відтінки сірого і виведення результату на Canvas
function customGrayscale(imageInput, canvasOutput)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height); // Отримуємо масив пікселів зображення
    imageData.data.set(RGBArrayToGray(imageData.data)); // Перетворюємо у відтінки сірого
    context.putImageData(imageData, 0, 0); // Виводимо нові значення пікселів на канву
    let outputContext = canvasOutput.getContext('2d');
    canvasOutput.width = canvas.width;
    canvasOutput.height = canvas.height;
    outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasOutput.width, canvasOutput.height);
}

// Функція для витягування даних вказаного каналу із зображення
function extractChannel(pixels, channel, color)
{
    let offset; // Номер субпікселя
    switch (channel)
    {
        case 'red':
            offset = 0;
            break;
        case 'green':
            offset = 1;
            break;
        case 'blue':
            offset = 2;
            break;
        default:
            return false; // Неправильно вказаний канал
    }
    let result = new Uint8ClampedArray(pixels.length);
    for (let i = 0, l = pixels.length; i < l; i += 4) {
        for (let j = 0; j < 3; j++) {
            if (!color || j == offset) {
                result[i + j] = pixels[i + offset]; // Записуємо значення вказаного субпікселя
            } else {
                result[i + j] = 0; // Якщо виводимо канал у кольорі, записуємо 0 у інші канали
            }
        }
        result[i + 3] = pixels[i + 3]; // Альфа-канал
    }
    return result;
}

// Функція розбивання зображення на канали
function customChannels(imageInput, canvasRed, canvasGreen, canvasBlue)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height); // Отримуємо масив пікселів зображення
    let pixels = imageData.data;
    let channels = ['red', 'green', 'blue'];
    let canvases = [canvasRed, canvasGreen, canvasBlue];
    for (let i in channels) {
        let channel = extractChannel(pixels, channels[i], true);
        let channelCanvas = document.createElement('canvas');
        channelCanvas.width = canvas.width;
        channelCanvas.height = canvas.height;
        let channelContext = channelCanvas.getContext('2d');
        let channelImageData = channelContext.getImageData(0, 0, channelCanvas.width, channelCanvas.height);
        channelImageData.data.set(channel);
        channelContext.putImageData(channelImageData, 0, 0); // Виводимо нові значення пікселів на канву
        let outputContext = canvases[i].getContext('2d');
        canvases[i].width = canvas.width;
        canvases[i].height = canvas.height;
        outputContext.drawImage(channelCanvas, 0, 0, channelCanvas.width, channelCanvas.height, 0, 0, canvases[i].width, canvases[i].height);
    }
}

// Функція нормалізації масиву пікселів зображення
function normalizePixels(pixels)
{
    let histogram = buildHistogram(pixels); // Вираховуємо гістограму
    let min = 0, max = 255; // Вираховуємо мінімальне і максимальне значення яскравості
    for (let i = 0, l = histogram.length; i < l; i++) {
        if (histogram[i] > 0) {
            if (!min) min = i;
            max = i;
        }
    }
    if (min < max) {
        let result = new Uint8ClampedArray(pixels.length);
        // Масштабуємо значення пікселів згідно визначених коефіцієнтів
        let scale = 255 / (max - min);
        for (let i = 0, l = pixels.length; i < l; i += 4) {
            for (let j = i; j < i + 3; j++) {
                result[j] = Math.round((pixels[j] - min) * scale);
            }
            result[i + 3] = pixels[i + 3]; // Альфа-канал
        }
        return result;
    }
    return pixels;
}

// Функція нормалізцації зображення і виведення результату на Canvas
// Опціонально виводить гістограму перетвореного зображення
function customNormalize(imageInput, canvasOutput, canvasHistogram)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;
    pixels = RGBArrayToGray(pixels); // Опціональне перетворення у відтінки сірого, можна закоментувати
    pixels = normalizePixels(pixels); // Нормалізація пікселів зображення
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0); // Виводимо нові значення пікселів на канву
    let outputContext = canvasOutput.getContext('2d');
    canvasOutput.width = canvas.width;
    canvasOutput.height = canvas.height;
    outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasOutput.width, canvasOutput.height);
    if (canvasHistogram) {
        // Якщо передали аргумент із канвою для гістограми, виводимо нову гістограму
        let histogram = buildHistogram(pixels, 256);
        drawHistogram(histogram, canvasHistogram);
    }
}

// Функція еквалізації масиву пікселів зображення
function equalizePixels(pixels)
{
    let histogram = buildHistogram(pixels);
    let wh = pixels.length / 4; // Загальна кількість пікселів у зображенні
    let levels = new Array(histogram.length); // Масив для співставлення яскравостей пікселів вхідного і вихідного зображення
    let q = wh / 255;
    for (let i = 0, l = histogram.length, sum = 0; i < l; i++) {
        sum += histogram[i]; // Кількість пікселів з яскравостями 0..i
        levels[i] = Math.floor(sum / q); // Вираховуємо яскравість на виході
    }
    let result = new Array(pixels.length);
    for (let i = 0, l = pixels.length; i < l; i += 4) {
        for (let j = i; j < i + 3; j++) {
            result[j] = levels[pixels[j]]; // Встановлюємо нове значення яскравості
        }
        result[i + 3] = pixels[i + 3]; // Альфа-канал
    }
    return result;
}

// Функція еквалізації зображення і виведення результату на Canvas
// Опціонально виводить гістограму перетвореного зображення
function customEqualize(imageInput, canvasOutput, canvasHistogram)
{
    let canvas = document.createElement('canvas');
    canvas.width = imageInput.naturalWidth;
    canvas.height = imageInput.naturalHeight;
    let context = canvas.getContext('2d');
    context.drawImage(imageInput, 0, 0, imageInput.naturalWidth, imageInput.naturalHeight); // Завантаження зображення на канву
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;
    pixels = RGBArrayToGray(pixels); // Опціональне перетворення у відтінки сірого, можна закоментувати
    pixels = equalizePixels(pixels); // Еквалізація пікселів зображення
    //pixels = normalizePixels(pixels); // Еквалізація пікселів зображення
    imageData.data.set(pixels);
    context.putImageData(imageData, 0, 0); // Виводимо нові значення пікселів на канву
    let outputContext = canvasOutput.getContext('2d');
    canvasOutput.width = canvas.width;
    canvasOutput.height = canvas.height;
    outputContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasOutput.width, canvasOutput.height);
    if (canvasHistogram) {
        // Якщо передали аргумент із канвою для гістограми, виводимо нову гістограму
        let histogram = buildHistogram(pixels, 256);
        drawHistogram(histogram, canvasHistogram);
    }
}

/* OpenCV */

function onOpenCvReady()
{
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

function openCVProcessImage()
{
    /* Обчислення гістограми */
    let src = cv.imread('canvasInput');
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0); // Перетворення зображення у відтінки сірого
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
    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate); // Обчислення гістограми
    let result = cv.minMaxLoc(hist, mask);
    let max = result.maxVal; // Максимальне значення кількості пікселів
    let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale, cv.CV_8UC3);
    // Малювання гістограми
    for (let i = 0; i < histSize[0]; i++) {
        let binVal = hist.data32F[i] * src.rows / max; // Масштабування графіку
        let point1 = new cv.Point(i * scale, src.rows - 1);
        let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
    }

    cv.imshow('canvasOutput', dst);
    cv.imshow('canvasOutputGray', src);
    dst.delete();

    //cv.normalize(hist, hist, 0, 255, cv.NORM_MINMAX, -1, none);
    
    /* Еквалізація */
    let src1 = cv.imread('canvasInput');
    let dstEq = new cv.Mat();
    cv.cvtColor(src1, src1, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(src1, dstEq);
    cv.imshow('canvasOutputEqualize', dstEq);
    dstEq.delete();

    let src2 = cv.imread('canvasInput');
    let equalDst = new cv.Mat();
    let claheDst = new cv.Mat();
    cv.cvtColor(src2, src2, cv.COLOR_RGBA2GRAY, 0); // Перетворення зображення у відтінки сірого
    cv.equalizeHist(src2, equalDst); // Еквалізація
    let tileGridSize = new cv.Size(8, 8); // Розмір блоків зображення для алгоритму CLAHE
    let clahe = new cv.CLAHE(40, tileGridSize); // Вираховування параметрів перетворення
    clahe.apply(src2, claheDst); // Еквалізація по заданих параметрах
    cv.imshow('canvasOutputEqualize2', equalDst);
    cv.imshow('canvasOutputEqualize2', claheDst);
    claheDst.delete(); clahe.delete(); equalDst.delete();

    /* Нормалізація */
    let src3 = cv.imread('canvasInput');
    let dstNorm = new cv.Mat();
    cv.cvtColor(src3, src3, cv.COLOR_RGBA2GRAY, 0); // Опціональне перетворення у відтінки сірого, можна закоментувати
    // Мінімальне і максимальне значення яскравості
    let minValue = 0;
    let maxValue = 255;
    for (let i = 0; i < histSize[0]; i++) {
        if (hist.data32F[i] > 0) {
            if (!minValue) {
                minValue = i;
            }
            maxValue = i;
        }
    }
    if (minValue < maxValue) {
        let scale2 = (255 / (maxValue - minValue)); // Коефіцієнт масштабування гістограми
        src3.convertTo(dstNorm, cv.CV_32F, scale2 / 255, - scale2 * minValue / 255); // Перетворення яскравості зображення відповідно до вирахованих коефіцієнтів
        cv.imshow('canvasOutputNormalize', dstNorm);
    }
    dstNorm.delete();

   srcVec.delete(); mask.delete(); hist.delete();
   src1.delete(); src2.delete();
}

let canvasInput = document.getElementById('canvasInput');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
    canvasInput.src = URL.createObjectURL(e.target.files[0]);
}, false);

canvasInput.onload = function() {
    // Самописні функції для обробки зображення
    customHistogram(canvasInput, document.getElementById('canvasCustomHistogram'));
    customRGBHistogram(canvasInput, document.getElementById('canvasCustomRGBHistogram'));
    customGrayscale(canvasInput, document.getElementById('canvasCustomGray'));
    customChannels(canvasInput, document.getElementById('canvasCustomRed'), document.getElementById('canvasCustomGreen'), document.getElementById('canvasCustomBlue'))
    customNormalize(canvasInput, document.getElementById('canvasCustomNormalize'), document.getElementById('canvasCustomNormalizeHistogram'));
    customEqualize(canvasInput, document.getElementById('canvasCustomEqualize'), document.getElementById('canvasCustomEqualizeHistogram'));

    // Реалізація за допомогою бібліотеки OpenCV
    openCVProcessImage();
};
