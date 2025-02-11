let g25Data = {};  // Stores modern G25 coordinates

async function loadG25Data() {
    let response = await fetch("Global25_PCA_modern_scaled.txt"); 
    let text = await response.text();
    parseG25File(text);
}

function parseG25File(data) {
    let lines = data.split("\n");
    let headers = lines[0].split(",").slice(1);  // Extract PC1-PC25

    for (let i = 1; i < lines.length; i++) {
        let parts = lines[i].split(",");
        if (parts.length < 26) continue;

        let population = parts[0].trim();
        let coords = parts.slice(1).map(Number);
        g25Data[population] = coords;
    }
}

function parseRawDNA(fileContent) {
    let snpData = {};
    let lines = fileContent.split("\n");

    for (let line of lines) {
        let parts = line.split("\t");
        if (parts.length >= 4) {
            let rsid = parts[0].trim();
            let genotype = parts[3].trim();
            snpData[rsid] = genotype;
        }
    }
    return snpData;
}

function computeG25(snpData) {
    let closestMatch = null;
    let minDistance = Infinity;
    let userVector = new Array(25).fill(0);

    // Calculate distance to each G25 population
    for (let pop in g25Data) {
        let refVector = g25Data[pop];
        let distance = 0;

        for (let i = 0; i < 25; i++) {
            distance += Math.abs(refVector[i] - userVector[i]); // Simple Manhattan distance
        }

        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = pop;
        }
    }

    return `Closest G25 match: ${closestMatch}\nG25 Coordinates: ${g25Data[closestMatch].join(", ")}`;
}

function generateCoordinates() {
    let fileInput = document.getElementById("dnaFile");
    let labelInput = document.getElementById("label");
    let outputDiv = document.getElementById("output");

    if (!fileInput.files.length) {
        outputDiv.innerText = "Please upload a raw DNA file.";
        return;
    }

    if (!labelInput.value.trim()) {
        outputDiv.innerText = "Please enter a G25 label.";
        return;
    }

    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
        let snpData = parseRawDNA(e.target.result);
        let result = computeG25(snpData);
        outputDiv.innerText = result;
    };

    reader.readAsText(file);
}

// Load G25 reference data on startup
loadG25Data();