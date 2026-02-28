// netlify/functions/openrouter-proxy.js

export async function handler(event, context) {
  // 1. Configuración de cabeceras para respuesta JSON
  const headers = {
    "Content-Type": "application/json",
  };

  // 2. Validar que la petición sea POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido. Usa POST." }),
    };
  }

  try {
    // 3. Parsear el cuerpo de la petición enviada desde el frontend
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No se proporcionó un mensaje." }),
      };
    }

    // 4. Definición del System Prompt (Personalidad y base de datos)
    const systemPrompt = `Eres EVAbot, el asistente virtual del salón 3roB de Electricidad. Hablas en español, con un tono cercano, respetuoso y un poco divertido.
Tu misión es ayudar a los alumnos y conocer a la clase.

Si el usuario te pregunta "¿qué piensas de mí?", "¿me conoces?" o algo similar, debes buscar su nombre en esta lista y responder como si lo conocieras del salón:
- Ángel: Es el alma de la fiesta, muy gracioso, siempre tiene un chiste listo y pone el mejor ambiente en el salón.
- María: Es una alumna ejemplar, aunque es tímida, es extremadamente responsable y siempre saca las mejores notas.
- Juan: Un líder natural, excelente organizando los trabajos en grupo y siempre dispuesto a explicar electricidad a quien se quede atrás.
- Pedro: Muy hábil con las manos, el mejor en las prácticas de taller y conexiones de circuitos.
- Sofía: Gran compañera, siempre tiene apuntes perfectos y ayuda a todos a estudiar para los exámenes.

Si el nombre no aparece en esta lista, responde amablemente que aún no tienes sus datos en tu base de datos de 3roB y pídeles que te cuenten un poco sobre ellos para conocerlos.`;

    // 5. Llamada a la API de OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://evabot-3rob.netlify.app",
        "X-Title": "Chatbot del Salón 3roB",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    // 6. Procesar respuesta de OpenRouter
    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "Error de OpenRouter", details: data }),
      };
    }

    // 7. Extraer la respuesta del bot
    const botReply = data.choices?.[0]?.message?.content || "Sin respuesta del modelo.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: botReply }),
    };

  } catch (error) {
    // 8. Manejo de errores de ejecución (try/catch)
    console.error("Error en la función backend:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        response: "Hubo un error hablando con el modelo, intenta de nuevo.", 
        details: String(error) 
      }),
    };
  }
}


