let dates = [];
const lines = [];
let index = 0;
let site = "google";
let isRunning = true;
let isActive = false;

function formatDate(t) {
  const d = new Date(parseInt(t));
  // d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
  return (
    ("0" + d.getDate()).slice(-2) +
    "/" +
    ("0" + d.getMonth()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    "h"
  );
}

function displayScreenshot(time) {
  const url = `/api/site/${site}/${time}/screenshot`;
  const screenshot = document.querySelector("#content .screenshot");
  if (screenshot) {
    screenshot.src = url;
    return;
  }
  document.getElementById(
    "content"
  ).innerHTML = `<img class="screenshot" src="${url}">`;
}

let display = function () {
  if (isActive) {
    return;
  }
  if (index >= dates.length) {
    index = 0;
  }
  if (index < 0) {
    index = dates.length - 1;
  }
  isActive = true;

  const previous = document.querySelector(".time.active");
  if (previous) {
    previous.className = "time";
  }

  document.getElementById("currentDate").innerHTML = formatDate(dates[index]);

  document.getElementById("time-" + dates[index]).className = "time active";

  // TODO display content
  displayScreenshot(dates[index]);

  isActive = false;
  if (isRunning) {
    setTimeout(display, 1000, ++index);
  }
};

document.body.onmousedown = document.body.ontouchstart = function (e) {
  if (e.target.className.indexOf("time") > -1) {
    return;
  }
  pause();
};
document.body.onmouseup = document.body.ontouchend = function (e) {
  if (e.target.className.indexOf("time") > -1) {
    return;
  }
  resume();
};
document.body.onkeydown = function (e) {
  // space
  if (e.keyCode == 32) {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
    // down & right
  } else if (e.keyCode == 39 || e.keyCode == 40) {
    pause();
    index++;
    display();
    // up & left
  } else if (e.keyCode == 37 || e.keyCode == 38) {
    pause();
    index--;
    display();
  }
};

let onClickTimeout = null;
let pause = function (e) {
  onClickTimeout = setTimeout(() => {
    document.body.className = "pause";
    isRunning = false;
  }, 150);
};

let resume = function () {
  clearTimeout(onClickTimeout);
  document.body.className = "";
  isRunning = true;
  display();
};

function activate(e) {
  index = dates.indexOf(parseInt(e.getAttribute("data-value"))) - 1;
}

function initTimeline() {
  let content = "";
  for (let t of dates) {
    const dateString = formatDate(t);

    content +=
      '<div id="time-' +
      t +
      '" class="time" onclick="activate(this)" data-value="' +
      t +
      '"><span>' +
      dateString +
      "</span></div>";
  }
  time_travel.innerHTML = content;
}

async function downloadTime(site) {
  dates = await $.get(`/api/site/${site}/visits`);
}

(async () => {
  await downloadTime("google");
  initTimeline();
  display();
})();
