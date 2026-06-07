import { useState } from "react";
import API_URL from "../config";

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askBackend = async () => {
    const res = await fetch(`${API_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <div>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={askBackend}>Ask</button>

      <p>{answer}</p>
    </div>
  );
}
