// Adobe After Effects Animation Script
// Collaborative Repository Activity Motion Design
// This script automates the creation of the collaborative motion design

// Main composition setup
function createMainComposition() {
    var comp = app.project.items.addComp("Collaborative Repository Activity", 1920, 1080, 1, 10, 30);
    comp.bgColor = [0.059, 0.090, 0.165]; // #0F172A
    
    return comp;
}

// Create background grid animation
function createBackgroundGrid(comp) {
    var gridLayer = comp.layers.addShape();
    gridLayer.name = "Background Grid";
    
    // Add grid pattern
    var gridGroup = gridLayer.property("Contents").addProperty("ADBE Vector Group");
    var gridPath = gridGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    var gridStroke = gridGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    
    gridStroke.property("Color").setValue([0.118, 0.161, 0.231]); // #1E293B
    gridStroke.property("Stroke Width").setValue(1);
    gridStroke.property("Opacity").setValue(30);
    
    // Animate grid floating
    var position = gridLayer.property("Transform").property("Position");
    position.setValueAtTime(0, [960, 540]);
    position.setValueAtTime(10, [950, 530]);
    position.setValueAtTime(20, [960, 540]);
    
    // Set easing
    for (var i = 1; i <= position.numKeys; i++) {
        position.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
        position.setTemporalEaseAtKey(i, [new KeyframeEase(0, 33), new KeyframeEase(0, 33)]);
    }
}

// Create central repository
function createRepository(comp) {
    var repoLayer = comp.layers.addShape();
    repoLayer.name = "Repository";
    
    // Main circle
    var repoGroup = repoLayer.property("Contents").addProperty("ADBE Vector Group");
    var repoEllipse = repoGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    var repoFill = repoGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    
    repoEllipse.property("Size").setValue([240, 240]);
    repoFill.property("Color").setValue([0.310, 0.275, 0.898]); // #4F46E5
    
    // Position at center
    repoLayer.property("Transform").property("Position").setValue([960, 540]);
    
    // Add pulsing animation
    var scale = repoLayer.property("Transform").property("Scale");
    scale.setValueAtTime(0, [100, 100]);
    scale.setValueAtTime(1.5, [105, 105]);
    scale.setValueAtTime(3, [100, 100]);
    
    // Set easing and loop
    for (var i = 1; i <= scale.numKeys; i++) {
        scale.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
        scale.setTemporalEaseAtKey(i, [new KeyframeEase(0, 33), new KeyframeEase(0, 33)]);
    }
    
    // Loop expression
    scale.expression = "loopOut('cycle')";
    
    return repoLayer;
}

// Create queue section
function createQueueSection(comp) {
    var queueLayer = comp.layers.addShape();
    queueLayer.name = "Queue Section";
    
    // Queue background
    var queueGroup = queueLayer.property("Contents").addProperty("ADBE Vector Group");
    var queueRect = queueGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    var queueFill = queueGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    var queueStroke = queueGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    
    queueRect.property("Size").setValue([320, 100]);
    queueRect.property("Roundness").setValue(25);
    queueFill.property("Color").setValue([0.122, 0.161, 0.216]); // #1F2937
    queueStroke.property("Color").setValue([0.220, 0.255, 0.318]); // #374151
    queueStroke.property("Stroke Width").setValue(4);
    
    // Position above repository
    queueLayer.property("Transform").property("Position").setValue([960, 360]);
    
    // Add glow animation
    var opacity = queueLayer.property("Transform").property("Opacity");
    opacity.setValueAtTime(0, 80);
    opacity.setValueAtTime(1, 100);
    opacity.setValueAtTime(2, 80);
    opacity.expression = "loopOut('cycle')";
    
    return queueLayer;
}

// Create agent with specific properties
function createAgent(comp, name, position, color, status, delay) {
    var agentLayer = comp.layers.addShape();
    agentLayer.name = name;
    
    // Agent circle
    var agentGroup = agentLayer.property("Contents").addProperty("ADBE Vector Group");
    var agentEllipse = agentGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    var agentFill = agentGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    
    agentEllipse.property("Size").setValue([80, 80]);
    agentFill.property("Color").setValue(color);
    
    // Position
    agentLayer.property("Transform").property("Position").setValue(position);
    
    // Floating animation
    var yPosition = agentLayer.property("Transform").property("Position");
    yPosition.setValueAtTime(delay, [position[0], position[1]]);
    yPosition.setValueAtTime(delay + 2, [position[0], position[1] - 10]);
    yPosition.setValueAtTime(delay + 4, [position[0], position[1]]);
    
    // Set easing and loop
    for (var i = 1; i <= yPosition.numKeys; i++) {
        yPosition.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER);
        yPosition.setTemporalEaseAtKey(i, [new KeyframeEase(0, 33), new KeyframeEase(0, 33)]);
    }
    
    yPosition.expression = "loopOut('cycle')";
    
    // Scale pulsing
    var scale = agentLayer.property("Transform").property("Scale");
    scale.setValueAtTime(delay, [100, 100]);
    scale.setValueAtTime(delay + 1, [110, 110]);
    scale.setValueAtTime(delay + 2, [100, 100]);
    scale.expression = "loopOut('cycle')";
    
    return agentLayer;
}

// Create flow line between agent and repository
function createFlowLine(comp, startPos, endPos, color, delay) {
    var flowLayer = comp.layers.addShape();
    flowLayer.name = "Flow Line";
    
    // Create path
    var flowGroup = flowLayer.property("Contents").addProperty("ADBE Vector Group");
    var flowPath = flowGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
    var flowStroke = flowGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    
    flowStroke.property("Color").setValue(color);
    flowStroke.property("Stroke Width").setValue(6);
    flowStroke.property("Opacity").setValue(70);
    
    // Animate stroke
    var strokeOpacity = flowStroke.property("Opacity");
    strokeOpacity.setValueAtTime(delay, 40);
    strokeOpacity.setValueAtTime(delay + 1, 80);
    strokeOpacity.setValueAtTime(delay + 2, 40);
    strokeOpacity.expression = "loopOut('cycle')";
    
    return flowLayer;
}

// Create data packet animation
function createDataPacket(comp, path, color, delay) {
    var packetLayer = comp.layers.addShape();
    packetLayer.name = "Data Packet";
    
    // Packet circle
    var packetGroup = packetLayer.property("Contents").addProperty("ADBE Vector Group");
    var packetEllipse = packetGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    var packetFill = packetGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    
    packetEllipse.property("Size").setValue([16, 16]);
    packetFill.property("Color").setValue(color);
    
    // Animate along path
    var position = packetLayer.property("Transform").property("Position");
    var scale = packetLayer.property("Transform").property("Scale");
    
    // Packet movement animation
    position.setValueAtTime(delay, path.start);
    position.setValueAtTime(delay + 3, path.end);
    
    // Scale animation (appear/disappear)
    scale.setValueAtTime(delay, [0, 0]);
    scale.setValueAtTime(delay + 0.3, [100, 100]);
    scale.setValueAtTime(delay + 2.7, [100, 100]);
    scale.setValueAtTime(delay + 3, [0, 0]);
    
    // Loop
    position.expression = "loopOut('cycle')";
    scale.expression = "loopOut('cycle')";
    
    return packetLayer;
}

// Main execution function
function createCollaborativeAnimation() {
    // Create main composition
    var mainComp = createMainComposition();
    
    // Create background elements
    createBackgroundGrid(mainComp);
    
    // Create repository
    var repository = createRepository(mainComp);
    
    // Create queue section
    var queue = createQueueSection(mainComp);
    
    // Create agents with different states
    var agent1 = createAgent(mainComp, "Agent 1 - Generating", [400, 200], [0.063, 0.725, 0.506], "GENERATING", 0);
    var agent2 = createAgent(mainComp, "Agent 2 - Coding", [1520, 200], [0.965, 0.620, 0.043], "CODING", 1);
    var agent3 = createAgent(mainComp, "Agent 3 - PR Ready", [400, 880], [0.937, 0.267, 0.267], "PR READY", 2);
    var agent4 = createAgent(mainComp, "Agent 4 - Merged", [1520, 880], [0.545, 0.361, 0.965], "MERGED", 3);
    
    // Create flow lines
    createFlowLine(mainComp, [400, 200], [960, 540], [0.024, 0.714, 0.831], 0.5);
    createFlowLine(mainComp, [1520, 200], [960, 540], [0.024, 0.714, 0.831], 1);
    createFlowLine(mainComp, [400, 880], [960, 540], [0.024, 0.714, 0.831], 1.5);
    createFlowLine(mainComp, [1520, 880], [960, 540], [0.024, 0.714, 0.831], 2);
    
    // Create data packets
    createDataPacket(mainComp, {start: [400, 200], end: [960, 540]}, [0.063, 0.725, 0.506], 1);
    createDataPacket(mainComp, {start: [1520, 200], end: [960, 540]}, [0.965, 0.620, 0.043], 2);
    createDataPacket(mainComp, {start: [400, 880], end: [960, 540]}, [0.937, 0.267, 0.267], 3);
    createDataPacket(mainComp, {start: [1520, 880], end: [960, 540]}, [0.545, 0.361, 0.965], 4);
    
    // Add title
    var titleLayer = mainComp.layers.addText("Collaborative Repository Activity");
    titleLayer.property("Source Text").setValue("Collaborative Repository Activity");
    titleLayer.property("Transform").property("Position").setValue([960, 100]);
    
    alert("Collaborative Repository Activity animation created successfully!");
}

// Execute the script
createCollaborativeAnimation();