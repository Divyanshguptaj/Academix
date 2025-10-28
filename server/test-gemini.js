
// const { GoogleGenerativeAI } = require('@google/generative-ai');
import { GoogleGenerativeAI } from "@google/generative-ai";
(async () => {
  const genAI = new GoogleGenerativeAI("AIzaSyBMWN9BoK3Kg1zBcgwK-ClEA2OJaF490hc");
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const r = await model.generateContent('Say "ok" if you can hear me.');
  console.log(r.response.text());
})();
