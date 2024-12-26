import MultiFilters from "./MultiFilters.js";

export default function App() {
  return (
    <div className="App">
      <MultiFilters />
    </div>
  );
}

// import axios from "axios";

// const sendTestData = async () => {
//   try {
//     const testData = "Hello, Backend!"; // Change this to a number if needed, e.g., 123
//     const response = await axios.post("http://localhost:5000/api/test", {
//       data: testData,
//     });
//     console.log("Response from backend:", response.data);
//   } catch (error) {
//     console.error("Error sending data to backend:", error);
//   }
// };

// const App = () => {
//   return (
//     <div>
//       <button onClick={sendTestData}>Send Test Data</button>
//     </div>
//   );
// };

// export default App;

