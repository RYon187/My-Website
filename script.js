const root = document.documentElement;

const canvas = document.getElementsByClassName("title-canvas")[0];
const ctx = canvas.getContext("2d");
const cursor = document.querySelector(".pointer");
const colorSpot = document.querySelector(".color-spot");
const lerp = (start, stop, amt) => amt * (stop - start) + start;
const menuContainer = document.querySelector(".menu-container");
const titleText = document.querySelector(".title-text");
const titleSubtext = document.querySelector(".title-subtext");
const menuItems = document.getElementsByClassName("menu-item");
const letters = document.getElementsByClassName("letter");

let cursorX = 0, cursorY = 0;
let lightSpotX = 0, lightSpotY = 0;
let mouseY = 0;
let mouseX = 0;

const cursorSize = cursor.getBoundingClientRect().width / 2;
const lightSpotSize = colorSpot.getBoundingClientRect().width / 2;

ctx.scale(1,1);
const dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
  );

canvas.width = dimensions.width;
canvas.height = dimensions.height;

const pixelsBetween = 50;
const numX = canvas.width / pixelsBetween;
const numY = canvas.height / pixelsBetween;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const minDistance = 100;
    for (let i = 0; i < numX; i++) {
        for (let k = 0; k < numY; k++) {
            const effectiveDistance = 700; 
            const intensity = 6;
            const changeX = pixelsBetween * i - cursor.getBoundingClientRect().x;
            const changeY = pixelsBetween * k - cursor.getBoundingClientRect().y;
            let distance = Math.sqrt(Math.pow(changeX, 2) + Math.pow(changeY, 2));

            distance = Math.max(distance, minDistance);

            const angleX = changeX / distance;
            const angleY = changeY / distance;
            const force = effectiveDistance - distance > 0 ? effectiveDistance - distance : 0;

            ctx.fillStyle = darkenColor(getComputedStyle(root).getPropertyValue('--dotColor'), distance / intensity);
            ctx.strokeStyle = 'transparent';
            ctx.beginPath();
            ctx.arc(
                pixelsBetween * i + (force * angleX) / intensity,
                pixelsBetween * k + (force * angleY) / intensity,
                3, 
                0, 
                2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();
        }
    }

    Array.from(letters).forEach(element => {

        let letterRect = element.getBoundingClientRect();
        let letterX = letterRect.x + letterRect.width / 2;
        let letterY = letterRect.y + letterRect.height / 2;
        let effectiveRange = 40;

        let letterDistance = Math.sqrt(Math.pow(letterX - cursor.getBoundingClientRect().x, 2) + Math.pow(letterY - cursor.getBoundingClientRect().y, 2));
        let distancePercent = (letterDistance != 0) ? Math.min(1, (effectiveRange) / letterDistance) : 0;

        if (letterDistance < 7 * effectiveRange) {
            let adjustmentAmount = Math.round(100 * distancePercent);
            let newColor = adjustRGBColor(getComputedStyle(root).getPropertyValue('--tColorMain'), 'red', -2 * adjustmentAmount);
            newColor = adjustRGBColor(newColor, 'green', -1 * adjustmentAmount);
            
            element.style.color = newColor;
            element.style.fontSize = (adjustmentAmount / 50 + 4) + "rem";
        } else {
            element.style.color = getComputedStyle(root).getPropertyValue('--tColorMain');
            element.style.fontSize = "4rem";
        }
    });

    cursorX = lerp(cursorX, mouseX, 0.1); 
    cursorY = lerp(cursorY, mouseY + window.scrollY, 0.1);
    lightSpotX = lerp(lightSpotX, mouseX, 0.02); 
    lightSpotY = lerp(lightSpotY, mouseY + window.scrollY, 0.02);

    cursor.style.transform = `translate(${cursorX - cursorSize}px, ${cursorY - cursorSize}px)`;
    colorSpot.style.transform = `translate(${lightSpotX - lightSpotSize}px, ${lightSpotY - lightSpotSize}px)`;

    requestAnimationFrame(animate); 
}

animate();

window.addEventListener('mousedown', (e) => {
    cursor.style.backgroundColor = "red";
    cursor.style.width = "9px";
    cursor.style.height = "9px";
});

window.addEventListener('mouseup', (e) => {
    cursor.style.backgroundColor = getComputedStyle(root).getPropertyValue('--pointerColor');
    cursor.style.width = "13px";
    cursor.style.height = "13px";
});

const updateOnScroll = () => {
    const scrollY = window.scrollY; 
    const maxScroll = 400; 

    const darkenAmount = Math.min(scrollY / maxScroll * 100, 100); 

    const baseColor = getComputedStyle(root).getPropertyValue('--tColorMain');
    const newColor = darkenColor(baseColor, darkenAmount);

    menuContainer.style.borderColor = newColor;
    // titleText.style.color = newColor;
    // titleSubtext.style.color = newColor;
    let i = menuItems.length;
    Array.from(menuItems).forEach(element => {
        i--; 
        element.style.color = newColor; 
        element.style.transform = `translateX(${Math.pow((scrollY * i)/100, 2 + i/10)}%)`;
    });
};

window.addEventListener('scroll', updateOnScroll);

function darkenColor(color, amount) {
    if (color.startsWith("#")) {
        color = color.slice(1);
    }

    const rgb = [
        parseInt(color.substring(0, 2), 16),
        parseInt(color.substring(2, 4), 16),
        parseInt(color.substring(4, 6), 16),
    ];

    const darkenedRgb = rgb.map((c) => Math.max(10, Math.round(c * (1 - amount / 100))));
    
    const darkenedHex = darkenedRgb
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("");
    
    return `#${darkenedHex}`; 
}

function adjustRGBColor(rgbString, channel, amount) {
    // Match the RGB values from the rgb() string
    const rgbMatch = rgbString.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

    if (rgbMatch) {
        // Extract the RGB values and convert them to numbers
        let r = parseInt(rgbMatch[1]);
        let g = parseInt(rgbMatch[2]);
        let b = parseInt(rgbMatch[3]);

        // Adjust the specified channel
        switch (channel.toLowerCase()) {
            case 'red':
                r = Math.min(Math.max(r + amount, 0), 255); // Clamp between 0 and 255
                break;
            case 'green':
                g = Math.min(Math.max(g + amount, 0), 255); // Clamp between 0 and 255
                break;
            case 'blue':
                b = Math.min(Math.max(b + amount, 0), 255); // Clamp between 0 and 255
                break;
            default:
                console.error('Invalid channel. Use "red", "green", or "blue".');
                return rgbString; // Return original if channel is invalid
        }

        // Return the new RGB string
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        console.error('Invalid RGB string format.');
        return rgbString; // Return original if format is invalid
    }
}


function getObjectFitSize(
    contains,
    containerWidth,
    containerHeight,
    width,
    height
  ) {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;
  
    if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }
  
    return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2
    };
}

// const audio = document.getElementById("myAudio");
//     const playButton = document.getElementById("playButton");

//     playButton.addEventListener("click", function () {
//         if (audio.paused) {
//             audio.play();
//             playButton.textContent = "Pause Audio";
//         } else {
//             audio.pause();
//             playButton.textContent = "Play Audio";
//         }
//     });