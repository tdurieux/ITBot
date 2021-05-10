const scriptColor = {};

function getRandomColor() {
  return (
    "#" +
    (Math.floor(Math.random() * 16777215).toString(16) + "000000").substring(
      0,
      6
    )
  );
}

function generateProfile(profile, container) {
  const s = new sigma({
    container,
    settings: {
      maxNodeSize: 3,
      minNodeSize: 3,
      zoomingRatio: 1,
      enableCamera: false,
      labelThreshold: 1000,
    },
  });
  function position(index) {
    const size = 10;
    const lineLength = container.clientWidth / size;
    const p = index * size;
    return {
      p: size,
      x: Math.floor(p % lineLength),
      y: Math.floor(p / lineLength),
    };
  }

  let index = 0;
  for (let n of profile) {
    index++;
    const nodeID = n.id;
    if (
      n.callFrame.url &&
      n.callFrame.url.indexOf("chrome-extension://") > -1
    ) {
      continue;
    }
    if (!scriptColor[n.callFrame.scriptId]) {
      scriptColor[n.callFrame.scriptId] = getRandomColor();
    }
    const color = scriptColor[n.callFrame.scriptId];
    let name = "";
    if (n.callFrame) {
      name = n.callFrame.functionName;
    }
    if (name == "") {
      name = "(anonymous)";
    }
    let scriptId = 0;
    if (n.callFrame) {
      scriptId = n.callFrame.scriptId;
    }
    const p = position(index);
    s.graph.addNode({
      id: "n" + nodeID,
      label: name,
      // Display attributes:
      x: p.x,
      y: p.y,
      size: 1,
      color: color,
    });
  }
  for (let n of profile) {
    const nodeID = n.id;
    if (n.children) {
      for (let childrenId of n.children) {
        s.graph.addEdge({
          id: "e" + nodeID + "" + childrenId + Math.random(),
          source: "n" + nodeID,
          target: "n" + childrenId,
          color: "#ccc",
        });
      }
    }
  }
  
  s.refresh();

  // s.startNoverlap();
  s.configForceAtlas2({
    // linLogMode: true,
    // adjustSizes: true,
    // outboundAttractionDistribution: true,
    // strongGravityMode: true,
    scalingRatio: 1500,
    slowDown: 0.3,
    gravity: 10,
    startingIterations: 1,
    iterationsPerRender: 3
  });
  s.startForceAtlas2();
  
  setTimeout(function () {
    s.killForceAtlas2();
  }, 10000);
  return s;
}
