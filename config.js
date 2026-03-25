document.addEventListener("DOMContentLoaded", () => {

    /* ------------------- BANDEAU ------------------- */

    let lastScroll = 0;
    const bandeau = document.querySelector('.bandeau');
    const scrollThreshold = 50;

    if (bandeau) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll <= 0) {
                bandeau.classList.remove('hidden');
                lastScroll = currentScroll;
                return;
            }

            if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;

            bandeau.classList.toggle('hidden', currentScroll > lastScroll);
            lastScroll = currentScroll;
        });
    }

    /* ------------------- INIT ------------------- */

    if (document.getElementById("gpio")) add_gpio("gpio");
    if (document.getElementById("sensors")) addSensor();
});

/* ------------------- TOGGLE ------------------- */

function showSection(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden");
}

/* ------------------- GPIO (DEBUG) ------------------- */

function add_gpio(containerId) {
    const container = document.getElementById(containerId);

    const div = document.createElement("div");
    div.className = "gpio-block";

    div.innerHTML = `
        <select class="gpio">
            <option>GPIO0</option>
            <option>GPIO1</option>
            <option>GPIO2</option>
            <option>GPIO3</option>
            <option>GPIO4</option>
            <option>GPIO5</option>
            <option>GPIO6</option>
            <option>GPIO7</option>
            <option>GPIO8</option>
            <option>GPIO9</option>
            <option>GPI10</option>
            <option>GPI11</option>
            <option>GPI12</option>
            <option>GPI13</option>
            <option>GPI14</option>
            <option>GPI15</option>
            <option>GPI16</option>
            <option>GPI17</option>
            <option>GPIO18</option>
            <option>GPIO19</option>
            <option>GPIO20</option>
            <option>GPIO21</option>
            <option>GPIO22</option>
            <option>GPIO23</option>
        </select>
        <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;

    container.appendChild(div);
}

/* ------------------- CAPTEURS (CONFIG) ------------------- */

let sensorCount = 0;

function addSensor() {
    sensorCount++;

    const div = document.createElement("div");
    div.className = "sensor-block";

    div.innerHTML = `
        <label>Nom du capteur</label>
        <input class="sensorname" value="temperature_${sensorCount}">

        <label>GPIO</label>
         <select class="gpio">
            <option>GPIO0</option>
            <option>GPIO1</option>
            <option>GPIO2</option>
            <option>GPIO3</option>
            <option>GPIO4</option>
            <option>GPIO5</option>
            <option>GPIO6</option>
            <option>GPIO7</option>
            <option>GPIO8</option>
            <option>GPIO9</option>
            <option>GPI10</option>
            <option>GPI11</option>
            <option>GPI12</option>
            <option>GPI13</option>
            <option>GPI14</option>
            <option>GPI15</option>
            <option>GPI16</option>
            <option>GPI17</option>
            <option>GPIO18</option>
            <option>GPIO19</option>
            <option>GPIO20</option>
            <option>GPIO21</option>
            <option>GPIO22</option>
            <option>GPIO23</option>
        </select>

        <label>Adresse</label>
        <input class="address" placeholder="0xXXXXXXXXXXXX">

        <button type="button" onclick="this.parentElement.remove()">❌ Supprimer</button>
        <hr>
    `;

    document.getElementById("sensors").appendChild(div);
}

/* ------------------- DEBUG YAML ------------------- */

function generateDebug() {

    const name = document.getElementById("debug_name").value;
    const board = document.getElementById("debug_board").value;
    const ssid = document.getElementById("debug_ssid").value;
    const password = document.getElementById("debug_password").value;

    if (!name || !ssid) {
        alert("Remplis le nom et le WiFi !");
        return;
    }
    const pins = new Set();

    document.querySelectorAll("#gpio .gpio").forEach(gpio => {
        pins.add(gpio.value);

    });

    let oneWire = "";
    pins.forEach(pin => {
        oneWire += `
            - platform: gpio
              pin: ${pin}`;
    });




    const yaml = `esphome:
  name: ${name}

esp32:
  board: ${board}

logger:
  level : DEBUG
  framework:
    type: esp-idf   # or "arduino" if you prefer


api:

ota:
    platform : esphome

wifi:
  ssid: "${ssid}"
  password: "${password}"

one_wire:
${oneWire}


`;

    downloadYaml(yaml, "debug.yaml");
}

/* ------------------- CONFIG YAML ------------------- */

function generateConfig() {

    const name = document.getElementById("config_name").value;
    const board = document.getElementById("config_board").value;
    const ssid = document.getElementById("config_ssid").value;
    const password = document.getElementById("config_password").value;

    if (!name || !ssid) {
        alert("Remplis le nom et le WiFi !");
        return;
    }
    const pins = new Set();

    document.querySelectorAll(".gpio_sensor").forEach(gpio => {
        pins.add(gpio.value);
    });

    let oneWire = "";
    pins.forEach(pin => {
        oneWire += `
            - platform: gpio
              pin: ${pin}`;
    });




    let sensorsYaml = "";

    document.querySelectorAll("#sensors .sensor-block").forEach(sensor => {

        const sensorName = sensor.querySelector(".sensorname").value;
        const address = sensor.querySelector(".address").value;
        const gpio = sensor.querySelector(".address").value;

    if (!address) return;

        
        sensorsYaml += `
  - platform: dallas_temp
    name: "${sensorName}"
    address: ${address}
    update_interval: 30s`;
    });

    const yaml = `esphome:
  name: ${name}

esp32:
  board: ${board}
  framework:
    type: esp-idf   # or "arduino" if you prefer


logger:
  level : DEBUG

api:

ota:
    platform : esphome

wifi:
  ssid: "${ssid}"
  password: "${password}"

one_wire:
${oneWire}

sensor:
${sensorsYaml}
`;

    downloadYaml(yaml, "config.yaml");
}

/* ------------------- DOWNLOAD (FIX) ------------------- */

function downloadYaml(content, filename) {

    const blob = new Blob([content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link); // 🔥 FIX IMPORTANT
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}