export default async (request, context) => {
  // Solo permitir peticiones POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `
      Eres EVAbot, el asistente virtual del salón 3roB de Electricidad. Hablas en español, con un tono cercano, respetuoso y un poco divertido.
      Tu misión es ayudar a los alumnos y conocer a la clase.
      
      Si el usuario te pregunta "¿qué piensas de mí?", "¿me conoces?" o similar, busca su nombre en esta lista:
      - Ángel: Es el alma de la fiesta, muy gracioso, siempre tiene un chiste listo y pone el mejor ambiente en el salón.
      - María: Es una alumna ejemplar, aunque es tímida, es extremadamente responsable y siempre saca las mejores notas.
      - Juan: Un líder natural, excelente organizando los trabajos en grupo y siempre dispuesto a explicar electricidad a quien se quede atrás.
      - Pedro: Muy hábil con las manos, el mejor en las prácticas de taller y conexiones de circuitos.
      - Sofía: Gran compañera, siempre tiene apuntes perfectos y ayuda a todos a estudiar para los exámenes.

      Si el nombre no aparece en esta lista, responde amablemente que aún no tienes sus datos en tu base de datos de 3roB y pídeles que te cuenten un poco sobre ellos para conocerlos.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://3robelectricidad.netlify.app/", // Placeholder para tu URL real
        "X-Title": "Chatbot del Salón 3roB",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  model: "mistralai/mistral-small-24b-instruct-2501:free",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: message }
  ]
})
    });

    const data = await response.json();
    const botReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: botReply }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error en la función:", error);
    return new Response(JSON.stringify({ response: "Hubo un error hablando con el modelo, intenta de nuevo." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

};

