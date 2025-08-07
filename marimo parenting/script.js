const watering = document.getElementById("watering");
const vitamin = document.getElementById("vitamin");
const caring = document.getElementById("caring");
const mainPage = document.getElementById("mainPage");
const wateringPage = document.getElementById("wateringPage");
const vitaminPage = document.getElementById("vitaminPage");
const caringPage = document.getElementById("caringPage");
const back = document.getElementById("back");
const nameB = document.getElementById("nameB");

if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

watering.addEventListener("click", () => {
  mainPage.style.display = "none";
  wateringPage.style.display = "block";
  back.style.display = "block";
});

vitamin.addEventListener("click", () => {
  mainPage.style.display = "none";
  vitaminPage.style.display = "block";
  back.style.display = "block";
});

caring.addEventListener("click", () => {
  mainPage.style.display = "none";
  caringPage.style.display = "block";
  back.style.display = "block";
});

back.addEventListener("click", () => {
  wateringPage.style.display = "none";
  caringPage.style.display = "none";
  vitaminPage.style.display = "none";
  mainPage.style.display = "block";
  back.style.display = "none";
});

nameB.addEventListener("click", () => {
  const name = prompt("Name your marimo");
  if (name) {
    localStorage.setItem("marimoname", name);
    updateName();
  }
});

function updateName() {
  const savedname = localStorage.getItem("marimoname");
  if (savedname) {
    document.getElementById("nameDisplay").textContent = savedname;
  }
}
updateName();

document.getElementById("waterme").onclick = () => localStorage.setItem("lastw", Date.now());
document.getElementById("givevitamin").onclick = () => localStorage.setItem("lastv", Date.now());
document.getElementById("care").onclick = () => localStorage.setItem("lastc", Date.now());

function updateImg(imageId, timerKey, time, sadImg) {
  const lastTime = localStorage.getItem(timerKey);
  const img = document.getElementById(imageId);
  if (!img) return;

  const now = Date.now();
  if (lastTime && now - parseInt(lastTime) > time) {
    img.src = sadImg;
  } else {
    img.src = "assets/marimo.png";
  }
}

function Mood() {
  updateImg("watermain", "lastw", 7 * 24 * 60 * 60 * 1000, "assets/sadwater.png");
  updateImg("vitaminmain", "lastv", 3 * 24 * 60 * 60 * 1000, "assets/sadvitamin.png");
  updateImg("caremain", "lastc", 1 * 36 * 60 * 60 * 1000, "assets/sadcaring.png");
}

setInterval(() => {
  showElapsed("lastw", "wateringTimer");
  showElapsed("lastv", "vitaminTimer");
  showElapsed("lastc", "caringTimer");
  Mood();
}, 1000);

function showElapsed(key, elementId) {
  const saved = localStorage.getItem(key);
  if (!saved) return;

  const now = Date.now();
  const diff = now - parseInt(saved);

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const formatted = `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  document.getElementById(elementId).textContent = formatted;
}

function sendReminder(title, body){
  const name = localStorage.getItem("marimomame") || "Your Marimo";
  if (Notification.permission=="granted"){
    new Notification(
      title.replace("{name}", name),
      { body: body.replace("{name}", name) }
    );
  }
}

function checkReminder(){
  const now = Date.now();
  const lastW = parseInt(localStorage.getItem("lastw") || 0);
  const lastV = parseInt(localStorage.getItem("lastv") || 0);
  const lastC = parseInt(localStorage.getItem("lastc") || 0);

  if (now - lastW > 6 * 24 * 60 * 60 * 1000){
    sendReminder("{name} is thirsty!", "You havent watered {name} in a while.");
  }
  if (now - lastV > 2.5 * 24 * 60 * 60 * 1000){
    sendReminder("{name} need vitemins!", "Don't forget to give her vitamins.");
  }
  if (now - lastC > 30 * 60 * 60 * 1000){
    sendReminder("{name} is feeling unloved!", "Give some attention to {name}");
  }
}

setInterval(checkReminder, 60 * 1000);