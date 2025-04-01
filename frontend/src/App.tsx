import React from "react";
import { Routes, Route } from "react-router-dom";
import FullGame from "./FullGame";
import Instructions from "./Instructions";
const App: React.FC = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Instructions />} />
                <Route path="/play" element={<FullGame />} />
            </Routes>
        </div>
    );
};

export default App;
