import { useEffect } from "react";
import "./App.css";
import Nav from "./components/Header";
import MainPart from "./components/Main";
import { socket } from "./socket";

function App() {
  useEffect(() => {
    function onConnect() {
      console.log("User conencted from React.js application!");
    }

    function onDisconnect() {
      console.log("user disconnected from React.js");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <>
      <Nav></Nav>
      <MainPart></MainPart>
    </>
  );
}

export default App;
