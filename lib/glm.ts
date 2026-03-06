export async function callGLM(promptText: string) {
  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: "glm-4",
      messages: [
        { role: "user", content: promptText }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
