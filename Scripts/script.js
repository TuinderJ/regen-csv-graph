const form = document.querySelector(`form`);
const button = document.querySelector(`button`);
const fill = [];
const colors = [`black`, `red`, `green`, `blue`, `purple`];
let color = 0;
let headers;
let data;
let listToggle = false;

const handleSubmit = e => {
  e.preventDefault();
  const file = form.file.files[0];

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    data = csvToArray(text);
    // console.log(data);

    renderGraph();
  };

  reader.readAsText(file);
};

const renderGraph = () => {
  if (!listToggle) {
    document.body.innerHTML = `
    <div class = "container">
      <button id = "data-select-button" onclick = "selectData()">Select Data</button>
      <canvas></canvas>
    </div>
    `;
  } else {
    const container = document.querySelector(`.container`);
    container.innerHTML = `
    <button id = "data-select-button" onclick = "selectData()">Select Data</button>
    <canvas></canvas>
    `;
  }
  const canvas = document.querySelector(`canvas`);
  canvas.width = data.length;
};

const csvToArray = (str, delimiter = `,`) => {
  // Delete the top information
  let csvStr = str;
  let i = 0;
  while (true) {
    if (i === 100) break;
    if (csvStr.substring(0, 4) === `Date` || csvStr.substring(0, 6) === `"Date"`) break;
    csvStr = csvStr.slice(csvStr.indexOf(`\n`) + 1);
    i++;
  }

  headers = csvStr.split(`\n`).slice(0, 1).join().split(delimiter);
  headers.pop();
  headers = headers.map(header => header.replaceAll(`"`, ``).replace(`�`, `°`));

  let rows = csvStr.slice(csvStr.indexOf(`\n`) + 1).split(`\n`);
  rows = rows.map(row => {
    return row.slice(0, row.length - 2);
  });

  const data = rows.map(row => {
    if (row !== ``) {
      const values = row.split(delimiter);
      const el = headers.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return el;
    }
  });

  return data;
};

const selectData = () => {
  listToggle = !listToggle;
  const body = document.body;

  if (listToggle) {
    const ul = document.createElement(`ul`);
    headers.forEach(header => {
      const li = document.createElement(`li`);
      li.textContent = header;
      li.addEventListener(`click`, renderGraphedData);
      ul.appendChild(li);
    });

    body.appendChild(ul);
  } else {
    const ul = document.querySelector(`ul`);
    ul.remove();
  }
};

const renderGraphedData = e => {
  renderGraph();
  const newDataset = e.target.textContent;
  let found = false;
  let foundIndex;
  // console.log(fill);
  fill.forEach(({ dataset }, index) => {
    if (dataset === newDataset) {
      found = true;
      foundIndex = index;
      // console.log(`found`, foundIndex);
    }
  });

  if (found) {
    fill.splice(foundIndex, 1);
    // console.log(`removed`, fill);
  } else {
    const newData = { color: colors[color], dataset: newDataset };
    if (color >= colors.length) {
      color = 0;
    } else {
      color++;
    }
    fill.push(newData);
  }

  const canvas = document.querySelector(`canvas`);
  const c = canvas.getContext(`2d`);

  // Clear canvas and left/bottom
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Set height
  fill.forEach(({ dataset }) => {
    data.forEach(row => {
      if (row !== undefined) {
        const y = row[dataset].replaceAll(`"`, ``);
        if (y > canvas.height) canvas.height = y;
      }
    });
  });
  // Add 200 to height and round to nearest 200
  canvas.height = Math.round((canvas.height + 200) / 200) * 200;

  // Draw horizontal bars and fill datapoints
  c.strokeStyle = `lightgrey`;
  c.lineWidth = 1;

  // Datapoints
  const container = document.querySelector(`.container`);
  const left = document.createElement(`div`);
  container.appendChild(left);

  left.classList.add(`left`);
  const bottom = document.createElement(`div`);
  bottom.classList.add(`bottom`);
  container.appendChild(bottom);

  // Horizontal bars
  const numberOfHorizontalDataPoints = canvas.height / 100;
  for (let i = 1; i < numberOfHorizontalDataPoints + 2; i++) {
    const div = document.createElement(`div`);
    div.textContent = ((canvas.height / numberOfHorizontalDataPoints) * (numberOfHorizontalDataPoints + 1 - i)).toFixed(0);
    left.appendChild(div);

    y = (canvas.height / numberOfHorizontalDataPoints) * i;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(canvas.width, y);
    c.stroke();
  }

  // Fill data
  fill.forEach(({ color, dataset }) => {
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, canvas.height);
    let x = 0;

    data.forEach(row => {
      if (row !== undefined) {
        const y = row[dataset].replaceAll(`"`, ``);
        c.lineTo(x, canvas.height - y);
        x++;
      }
    });
    c.stroke();

    // Fill out Legend
    const div = document.createElement(`div`);
    div.style.color = color;
    div.textContent = dataset;
    bottom.appendChild(div);
  });
};

button.addEventListener(`click`, handleSubmit);
