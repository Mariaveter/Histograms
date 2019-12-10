# Лабораторна робота по  вивченню гістограм зображення та використання бібліотеки OpenCV.js для роботи з зображеннями

В лабораторній роботі використовувалась мова програмування Javascript та бібліотека для обробки зображень OpenCV.  

### Як встановити
 Отримання вихідного коду

  ```
  git clone https://github.com/Mariaveter/Histograms.git
  cd Histograms
  
  ```
    
### Як запустити 

В директорії Histograms відкрийте файл index.html в браузері і скориставшись кнопною в центрі екрана завантажте зображення для обробки.

Оскільки лабораторна робота написана виключно на Javascript, html та css, додатковий запуск сервера для її обробки не потрібний. 

### Зауважте

Данна робота, по факту, складається з двох частин:
  1) Розрахунки робились "вручну" з використанням чистого Javascript  в т.ч. його методів для роботи з елементом canvas та відповідних математичних формул. 
  2) Аналогічні гістограми та нормалізовані зображення виводились з допомогою бібліотеки OpenCV. 


Функція для нормалізації малюнка на Javascript

```Javascript

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

```

Побачити як працює данна програма ви можете також по посиланню:
 [view](http://miss-elegance.com.ua/histograms/)






