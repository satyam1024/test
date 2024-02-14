import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; 

import { YoutubeTranscript } from 'youtube-transcript';
const app = express();
const port = 3000;

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
});


app.use(bodyParser.json());
app.use(cors()); 

app.post('/generate-summary', async (req, res) => {
  
    try {
        console.log('Request received');
        const videoUrl = req.body.videoUrl;
        console.log('Video URL:', videoUrl);

        if (!videoUrl) {
            return res.status(400).json({ error: 'Missing videoUrl in the request body' });
        }

        const transcript = await getVideoTranscript(videoUrl);
        console.log("transcript complete");
        const summary = await generateSummary('summarize the following in english ' + transcript);

        console.log('Sending response',summary);
        res.json({ summary });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/generate-notes', async (req, res) => {
  
  try {
      console.log('Request received');
      const videoUrl = req.body.videoUrl;
      console.log('Video URL:', videoUrl);
      if (!videoUrl) {
          return res.status(400).json({ error: 'Missing videoUrl in the request body' });
      }

      const transcript = await getVideoTranscript(videoUrl);
      console.log("transcript complete");
      const summary = await generateNotes(' make notes from following in english' + transcript);

      console.log('Sending response',summary);
      res.json({ summary });
  } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


export async function getVideoTranscript(videoUrl) {
    try {

      const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (transcript) {
  
        const transcriptText = transcript.map((item) => item.text).join(' ');
        return transcriptText;
      } else {
        return null; 
      }
    } catch (error) {
      console.error('Error fetching video transcript:', error.message);
      return null;
    }
  }

async function generateSummary(text) {
    try {
        console.log("in function");

    const chatCompletion = await openai.chat.completions.create({
    messages: [
        {"role": "user", "content": text},
    ],
    model: "gpt-3.5-turbo",
  });
  if (chatCompletion.choices && chatCompletion.choices.length > 0) {
   
    const generatedText = chatCompletion.choices[0].message.content;

    return generatedText
  } else {
    console.error('No choices found in the response.');
  }
  return "unable to do";
  
} catch (error) {
    console.error('Error generating summary: \n', error);
    throw new Error('Error generating summary');

}
}

async function generateNotes(text) {
  try {
      console.log("in function");

  const chatCompletion = await openai.chat.completions.create({
  messages: [
      {"role": "user", "content": text},
  ],
  model: "gpt-3.5-turbo",
});
if (chatCompletion.choices && chatCompletion.choices.length > 0) {
  
  const generatedText = chatCompletion.choices[0].message.content;

  return generatedText
} else {
  console.error('No choices found in the response.');
}
return "unable to do";

} catch (error) {
  console.error('Error generating notes: \n', error);
  throw new Error('Error generating notes');

}
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});