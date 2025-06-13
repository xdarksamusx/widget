// import "./App.css";
import "./index.css";
import ChatWidget from "./components/ChatWidget";
import { APIProvider } from "./context/APIContext";
function App() {
  return (
    <div className="App">
      <APIProvider>
        <div className="relative min-h-screen">
          <div className="text-center mt-4"></div>
          <ChatWidget />
        </div>
      </APIProvider>
    </div>
  );
}

export default App;
