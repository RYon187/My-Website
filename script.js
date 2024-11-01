const root = document.documentElement;

const canvas = document.getElementsByClassName("title-canvas")[0];
const ctx = canvas.getContext("2d");
const cursor = document.querySelector(".pointer");
const lerp = (start, stop, amt) => amt * (stop - start) + start;
const menuContainer = document.querySelector(".menu-container");
const titleText = document.querySelector(".title-text");
const titleSubtext = document.querySelector(".title-subtext");
const menuItems = document.getElementsByClassName("menu-item");

let cursorX = 0;
let cursorY = 0;
let mouseY = 0;
let mouseX = 0;

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
    const minDistance = 10;
    for (let i = 0; i < numX; i++) {
        for (let k = 0; k < numY; k++) {
            const effectiveDistance = 500; 
            const intensity = 7;
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

    cursorX = lerp(cursorX, mouseX, 0.1); 
    cursorY = lerp(cursorY, mouseY + window.scrollY, 0.1);

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

    requestAnimationFrame(animate); 
}

animate();

const updateOnScroll = () => {
    const scrollY = window.scrollY; 
    const maxScroll = 400; 

    const darkenAmount = Math.min(scrollY / maxScroll * 100, 100); 

    const baseColor = getComputedStyle(root).getPropertyValue('--tColorMain');
    const newColor = darkenColor(baseColor, darkenAmount);

    menuContainer.style.borderColor = newColor;
    // titleText.style.color = newColor;
    // titleSubtext.style.color = newColor;

    Array.from(menuItems).forEach(element => {
        element.style.color = newColor; 
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

    // Adjust the amount to darken
    const darkenedRgb = rgb.map((c) => Math.max(10, Math.round(c * (1 - amount / 100))));
    
    // Convert back to hex
    const darkenedHex = darkenedRgb
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("");
    
    return `#${darkenedHex}`; // Return the hex color string
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