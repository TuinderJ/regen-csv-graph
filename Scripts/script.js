const form = document.querySelector(`form`);
const button = document.querySelector(`button`);

const handleSubmit = e => {
  e.preventDefault();
  const file = form.file.files[0];

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const data = csvToArray(text);
    // console.log(data);

    renderGraph(data);
  };

  reader.readAsText(file);
};

const renderGraph = data => {
  document.body.innerHTML = `<div class = "container"><canvas></canvas></div>`;
  const canvas = document.querySelector(`canvas`);
  canvas.width = data.length;
  const c = canvas.getContext(`2d`);

  // Decide what data to look at
  const fill = [
    {
      color: `red`,
      dataset: `"Aftertreatment Diesel Oxidation Catalyst Intake Temperature (�F)"`,
    },
    {
      color: `green`,
      dataset: `"Aftertreatment Diesel Particulate Filter Intake Temperature (�F)"`,
    },
    {
      color: `blue`,
      dataset: `"Aftertreatment Diesel Particulate Filter Outlet Temperature (�F)"`,
    },
  ];

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
  for (let i = 1; i < numberOfHorizontalDataPoints + 1; i++) {
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
    (div.textContent = dataset.replaceAll(`"`, ``)).replace(`�`, `°`);
    bottom.appendChild(div);
  });
};

const csvToArray = (str, delimiter = `,`) => {
  let csvStr = str;
  for (let i = 0; i < 33; i++) {
    csvStr = csvStr.slice(csvStr.indexOf(`\n`) + 1);
  }

  const headers = csvStr.split(`\n`).slice(0, 1).join().split(delimiter);
  headers.pop();

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

button.addEventListener(`click`, handleSubmit);
