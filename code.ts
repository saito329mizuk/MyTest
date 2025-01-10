// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Runs this code if the plugin is run in Figma

if (figma.editorType === 'figma') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many rectangles on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'process-json') {
      const jsonData = msg.data;
  
      // Variable collectionsを作成
      const collection = figma.variables.createVariableCollection("Generated Variables");
      const defaultModeId = collection.modes[0].modeId; // モードIDを取得
  
      // JSONデータを解析してVariablesを作成
      for (const category in jsonData) {
        for (const key in jsonData[category]) {
          const value = jsonData[category][key];
  
          if (typeof value === 'string' && value.startsWith('#')) {
            // 色変数を追加
            const variable = figma.variables.createVariable(key, collection, 'COLOR');
            
            // HEXをRGBに変換して設定
            const rgba = hexToRgba(value);
            variable.setValueForMode(defaultModeId, rgba);
          } 
          else if (typeof value === 'string' && value.endsWith('px')) {
            // サイズ変数を追加
            const variable = figma.variables.createVariable(key, collection, 'FLOAT');
            const numericValue = parseFloat(value.replace('px', ''));
            variable.setValueForMode(defaultModeId, numericValue);
          }
        }
      }
  
      figma.closePlugin("Variables generated successfully!");
    }
  };
  

  
}
  // HEXカラーコードをRGBAに変換するユーティリティ関数
  function hexToRgba(hex: string) {
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
    const bigint = parseInt(hex, 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
      a: 1, // アルファ値（不透明）
    };
  }
// Runs this code if the plugin is run in FigJam
if (figma.editorType === 'figjam') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many shapes and connectors on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage =  (msg: {type: string, count: number}) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
      // This plugin creates shapes and connectors on the screen.
      const numberOfShapes = msg.count;

      const nodes: SceneNode[] = [];
      for (let i = 0; i < numberOfShapes; i++) {
        const shape = figma.createShapeWithText();
        // You can set shapeType to one of: 'SQUARE' | 'ELLIPSE' | 'ROUNDED_RECTANGLE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT'
        shape.shapeType = 'ROUNDED_RECTANGLE';
        shape.x = i * (shape.width + 200);
        shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
        figma.currentPage.appendChild(shape);
        nodes.push(shape);
      }

      for (let i = 0; i < numberOfShapes - 1; i++) {
        const connector = figma.createConnector();
        connector.strokeWeight = 8;

        connector.connectorStart = {
          endpointNodeId: nodes[i].id,
          magnet: 'AUTO',
        };

        connector.connectorEnd = {
          endpointNodeId: nodes[i + 1].id,
          magnet: 'AUTO',
        };
      }

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}
