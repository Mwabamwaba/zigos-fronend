// Test file showing correct OpenAI API usage
// The code you provided had some issues - here's the corrected version:

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

// CORRECT OpenAI API usage:
async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "write a haiku about ai" }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    console.log("AI Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Test the function
testOpenAI();

// Issues with your original code:
// 1. `openai.responses.create()` doesn't exist - correct is `openai.chat.completions.create()`
// 2. `input` parameter doesn't exist - correct is `messages` array
// 3. `store: true` is not needed for basic usage
// 4. `output_text` doesn't exist - correct is `choices[0].message.content`
