/* LOADER  */

function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loader").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
    }, 500);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hideLoader, 800);
});


/*  PAGE NAVIGATION */

function openSection(id) {
    showLoader();
    setTimeout(() => {
        document.getElementById("dashboardPage").style.display = "none";
        document.getElementById(id).style.display = "block";
        hideLoader();
    }, 600);
}

function goHome() {
    showLoader();
    setTimeout(() => {
        document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
        document.getElementById("dashboardPage").style.display = "flex";
        hideLoader();
    }, 600);
}


/*  WEATHER SYSTEM */

function loadWeather() {
    weatherInfo.innerHTML = "Detecting location...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, fail);
    } else {
        weatherInfo.innerHTML = "❌ GPS not supported!";
    }

    function success(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        let key = "b7388b4a4673cffb2a468f570e737d66";

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`)
            .then(response => response.json())
            .then(data => {
                weatherInfo.innerHTML = `
                    <b>${data.name}</b><br>
                    🌡 Temperature: ${data.main.temp}°C<br>
                    💧 Humidity: ${data.main.humidity}%<br>
                    🍃 Wind: ${data.wind.speed} m/s<br>
                    🤒 Feels Like: ${data.main.feels_like}°C<br>
                    ☁ Condition: ${data.weather[0].description}
                `;

                // Update crop suggestions
                generateCropSuggestions(data.main.temp, data.main.humidity);
            });
    }

    function fail() {
        weatherInfo.innerHTML = "❌ Location access denied!";
    }
}

window.onload = loadWeather;


/* MARKET PRICE  */

function loadMarket() {
    let wheat = (2000 + Math.random() * 500).toFixed(0);
    let rice = (1800 + Math.random() * 400).toFixed(0);
    let maize = (1500 + Math.random() * 300).toFixed(0);

    marketInfo.innerHTML = `
        🌾 Wheat: ₹${wheat} / quintal<br>
        🍚 Rice: ₹${rice} / quintal<br>
        🌽 Maize: ₹${maize} / quintal
    `;
}


/*  POPULAR CROP AUTOFILL */

function autofillCrop(name, days, water, fert) {
    cropName.value = name;
    waterCount.value = water;
    fertCount.value = fert;
    cropPlanMsg.innerHTML = `✔ Selected ${name}`;
}


/* SAVE CROP PLAN  */

function saveCropPlan() {

    if (!fieldName.value || !cropName.value || !sowingDate.value ||
        !waterCount.value || !fertCount.value) {
        cropPlanMsg.innerHTML = "❌ Please fill all fields!";
        return;
    }

    let sow = new Date(sowingDate.value);

    let cropDuration = {
        Wheat: 110,
        Rice: 140,
        Potato: 90,
        Maize: 100
    };

    let harvestDays = cropDuration[cropName.value] || 100;
    let harvestDate = new Date(sow.getTime() + harvestDays * 24 * 60 * 60 * 1000);

    let user = firebase.auth().currentUser;

    firebase.firestore().collection("crops").add({
        userId: user.uid,
        fieldName: fieldName.value,
        cropName: cropName.value,
        sowingDate: sowingDate.value,
        harvestDate: harvestDate.toISOString(),
        waterCount: parseInt(waterCount.value),
        fertCount: parseInt(fertCount.value),
        createdAt: new Date().toISOString()
    })
        .then(() => {
            cropPlanMsg.innerHTML = "✔ Crop reminder added!";
            setTimeout(() => location.href = "mycrops.html", 800);
        });
}


/* NPK CALCULATOR */

function calculateNPK() {
    npkResult.innerHTML = `
        Ratio → <b>${nitrogen.value}:${phosphorus.value}:${potassium.value}</b>
    `;
}


/*  UPDATED CROP SUGGESTIONS  */

function generateCropSuggestions(temp = 28, humidity = 50) {

    let list = "";

    if (temp > 30 && humidity > 60) {
        list = `
            <div class='suggest-item'><span>🌾</span>Rice – Best for hot & humid climate</div>
            <div class='suggest-item'><span>🧵</span>Jute – Requires heavy moisture</div>
            <div class='suggest-item'><span>🌱</span>Sugarcane – Grows well in high humidity</div>
        `;
    }
    else if (temp < 20) {
        list = `
            <div class='suggest-item'><span>🌾</span>Wheat – Grows well in cool weather</div>
            <div class='suggest-item'><span>🌻</span>Mustard – Best for winter season</div>
            <div class='suggest-item'><span>🥔</span>Potato – Strong winter crop</div>
        `;
    }
    else {
        list = `
            <div class='suggest-item'><span>🌽</span>Maize – Suitable for moderate climate</div>
            <div class='suggest-item'><span>🍅</span>Tomato – Grows well in mild weather</div>
            <div class='suggest-item'><span>🫘</span>Pulses – Perfect for balanced climate</div>
        `;
    }

    cropSuggest.innerHTML = list;
}


/* = UPDATED FERTILIZER GUIDE  */

function generateFertilizerGuide() {
    fertGuide.innerHTML = `
        <div class='suggest-item'><span>🌿</span>Nitrogen → Helps leaf growth</div>
        <div class='suggest-item'><span>🌱</span>Phosphorus → Root and flower development</div>
        <div class='suggest-item'><span>🛡</span>Potassium → Boosts plant immunity</div>
        <div class='suggest-item'><span>🧪</span>NPK 17-17-17 → Best general fertilizer</div>
        <div class='suggest-item'><span>🍅</span>NPK 20-20-20 → Ideal for vegetables</div>
    `;
}


/*  PROFILE POPUP  */

function openProfile() {
    document.getElementById("profilePopup").style.display = "flex";

    let user = firebase.auth().currentUser;

    firebase.firestore().collection("farmers").doc(user.uid).get().then(doc => {
        let data = doc.data();
        document.getElementById("pName").innerText = data.name;
        document.getElementById("pEmail").innerText = data.email;
        document.getElementById("pPhone").innerText = data.phone;
        document.getElementById("pAge").innerText = data.age;
    });
}

function closeProfile() {
    document.getElementById("profilePopup").style.display = "none";
}

function logoutUser() {
    firebase.auth().signOut().then(() => {
        location.href = "index.html";
    });
}


/*  LOAD DASHBOARD PROFILE NAME  */

firebase.auth().onAuthStateChanged(user => {
    firebase.firestore().collection("farmers").doc(user.uid).get().then(doc => {
        welcomeText.innerHTML = "Welcome, " + doc.data().name + " 👨‍🌾";
    });
});
