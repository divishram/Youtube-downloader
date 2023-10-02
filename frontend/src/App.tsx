import { useEffect, useState } from "react";
import "./App.css";
import Nav from "./components/Header";
import MainPart from "./components/Main";
import axios from "axios";
import { socket } from "./socket";
import Status from "./components/ConnectionState";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log("User conencted from React.js application!");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("user disconnected from React.js");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    }

  }, []);

  return (
    <>
      <Nav></Nav>
      <MainPart></MainPart>
      {/* <Status props={isConnected}></Status> */}
    </>
  );
}

export default App;
