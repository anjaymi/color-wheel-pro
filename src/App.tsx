import React from "react";
import "./styles/components.scss";
import { ColorWheel } from "./components/ColorWheel";

export const App = () => {
  return (
    <div className="app-container">
      <ColorWheel />
    </div>
  );
};

export default App;
